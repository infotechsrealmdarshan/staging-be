import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { successResponse, errorResponse } from "../utils/response.js";
import authHelper from "../utils/authHelper.js";
import redisClient from "../config/redis.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { auth } from "../config/firebase.js";

/* ---------------- Register User ---------------- */
export const registerUser = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // Validate input
    if (!fullName || !email || !password) {
      return errorResponse(
        res,
        "Full name, email and password are required",
        400
      );
    }

    // Password validation
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;

    if (!passwordRegex.test(password)) {
      return errorResponse(
        res,
        "Password must be at least 8 characters long and contain uppercase, lowercase and number",
        400
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, "Email already exists", 400);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      authProvider: "email",
      isEmailVerified: false,
    });

    await newUser.save();

    // Generate token
    const accessToken = jwt.sign(
      { id: newUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return successResponse(
      res,
      "User registered successfully",
      {
        accessToken,
        user: {
          _id: newUser._id,
          fullName: newUser.fullName,
          email: newUser.email,
          authProvider: newUser.authProvider,
          isEmailVerified: newUser.isEmailVerified,
          createdAt: newUser.createdAt,
          updatedAt: newUser.updatedAt,
        },
      },
      null,
      201,
      1
    );
  } catch (err) {
    console.error("Register Error:", err);
    return errorResponse(res, err.message || "Server error", 500);
  }
};


/* ---------------- Login User ---------------- */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, "Email and password are required", 400);
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return successResponse(res, "User not found", null, null, 200, 0);
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return successResponse(res, "Invalid credentials", null, null, 200, 0);
    }

    const accessToken = authHelper.generateAccessToken(user);
    const refreshToken = authHelper.generateRefreshToken(user);

    await redisClient.set(
      `refreshToken:${user._id}`,
      refreshToken,
      "EX",
      7 * 24 * 60 * 60
    );

    const userData = user.toObject();
    delete userData.password;

    return successResponse(
      res,
      "Login successful",
      { accessToken, user: userData },
      null,
      200,
      1
    );
  } catch (err) {
    return errorResponse(res, err.message || "Server error", 500);
  }
};


/* ---------------- Google Sign In ---------------- */
export const googleSignin = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return errorResponse(res, "Google ID token is required", 400);
    }

    // Verify Google ID token
    const decodedToken = await auth.verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;

    // Check if user exists in MongoDB
    let user = await User.findOne({ firebaseUid: uid });
    
    if (!user) {
      // Create new user if doesn't exist
      user = new User({
        fullName: name,
        email,
        firebaseUid: uid,
        authProvider: 'google',
        isEmailVerified: true,
        profileImg: picture,
      });
      await user.save();
    }

    const accessToken = authHelper.generateAccessToken(user);
    const refreshToken = authHelper.generateRefreshToken(user);

    await redisClient.set(
      `refreshToken:${user._id}`,
      refreshToken,
      "EX",
      7 * 24 * 60 * 60
    );

    const userData = user.toObject();
    delete userData.password;

    return successResponse(
      res,
      "Google sign in successful",
      { accessToken, user: userData },
      null,
      200,
      1
    );
  } catch (error) {
    console.error('Google signin error:', error);
    return errorResponse(res, error.message || "Server error", 500);
  }
};

/* ---------------- Forgot Password ---------------- */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return errorResponse(res, "Email is required", 400);
    }

    const user = await User.findOne({ email });
    if (!user) {
      return successResponse(res, "User not found", null, null, 404, 0);
    }

    // TODO: Implement email-based password reset (nodemailer)
    console.log('Password reset requested for:', email);

    return successResponse(res, "Password reset instructions sent to your email", null, null, 200, 1);
  } catch (error) {
    console.error('Forgot password error:', error);
    return errorResponse(res, error.message || "Server error", 500);
  }
};

/* ---------------- Get Profile ---------------- */
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user)
      return successResponse(res, "User not found", null, null, 200, 0);

    return successResponse(res, "Profile retrieved successfully", { user }, null, 200, 1);
  } catch (err) {
    return errorResponse(res, err.message || "Server error", 500);
  }
};

/* ---------------- Update Profile ---------------- */
export const updateProfile = async (req, res) => {
  try {
    const { email, mobile, fullName, profileImg } = req.body;

    const updateData = {};
    if (email) updateData.email = email;
    if (mobile) updateData.mobile = mobile;
    if (fullName) updateData.fullName = fullName;
    if (profileImg) updateData.profileImg = profileImg;

    // 🚫 Do not allow password updates here
    if (req.body.password)
      return successResponse(res, "Password cannot be updated via this route", null, null, 400, 0);

    const user = await User.findByIdAndUpdate(req.user.id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user)
      return successResponse(res, "User not found", null, null, 404, 0);

    return successResponse(res, "Profile updated successfully", { user }, null, 200, 1);
  } catch (err) {
    return errorResponse(res, err.message || "Server error", 500);
  }
};

/* ---------------- Delete Own Account ---------------- */
export const deleteOwnAccount = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id, 
      { 
        isDeleted: true, 
        deletedAt: new Date() 
      },
      { new: true }
    ).select("-password");
    
    if (!user)
      return successResponse(res, "User not found", null, null, 200, 0);

    await redisClient.del(`refreshToken:${req.user.id}`);

    return successResponse(res, "Account deleted successfully", { user }, null, null, 200, 1);
  } catch (err) {
    return errorResponse(res, err.message || "Server error", 500);
  }
};

/* ---------------- Admin: Get All Users ---------------- */
export const getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Parse pagination parameters
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    // Build search query
    let searchQuery = { isDeleted: { $ne: true } };
    
    if (search && search.trim()) {
      const searchTerm = search.trim();
      searchQuery.$or = [
        { fullName: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } },
        { mobile: { $regex: searchTerm, $options: 'i' } }
      ];
    }

    // Build sort query
    const sortQuery = {};
    sortQuery[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute queries
    const [users, totalCount] = await Promise.all([
      User.find(searchQuery)
        .select("-password")
        .sort(sortQuery)
        .skip(skip)
        .limit(limitNum),
      User.countDocuments(searchQuery)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    return successResponse(res, "All users fetched successfully", {
      users,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalCount,
        limit: limitNum,
        hasNextPage,
        hasPrevPage,
        nextPage: hasNextPage ? pageNum + 1 : null,
        prevPage: hasPrevPage ? pageNum - 1 : null
      }
    }, null, 200, users.length);
  } catch (err) {
    return errorResponse(res, err.message || "Server error", 500);
  }
};

/* ---------------- Admin: Get Single User ---------------- */
export const getUserById = async (req, res) => {
  try {
    const user = await User.findOne({ 
      _id: req.params.id, 
      isDeleted: { $ne: true } 
    }).select("-password");
    if (!user)
      return successResponse(res, "User not found", null, null, 200, 0);

    return successResponse(res, "User details fetched successfully", { user }, null, 200, 1);
  } catch (err) {
    return errorResponse(res, err.message || "Server error", 500);
  }
};

/* ---------------- Admin: Bulk Delete Users ---------------- */
export const bulkDeleteUsers = async (req, res) => {
  try {
    const { userIds } = req.body;

    // Validate input
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return errorResponse(res, "User IDs array is required", 400);
    }

    // Validate each ObjectId format
    const invalidIds = userIds.filter(id => !id.match(/^[0-9a-fA-F]{24}$/));
    if (invalidIds.length > 0) {
      return errorResponse(res, "Invalid user ID format detected", 400);
    }

    // Find users that exist and are not already deleted
    const existingUsers = await User.find({
      _id: { $in: userIds },
      isDeleted: { $ne: true }
    });

    if (existingUsers.length === 0) {
      return successResponse(res, "No valid users found to delete", {
        deletedCount: 0,
        notFound: userIds,
        alreadyDeleted: []
      }, null, 200, 0);
    }

    const existingUserIds = existingUsers.map(user => user._id.toString());
    const notFoundIds = userIds.filter(id => !existingUserIds.includes(id));

    // Soft delete users
    const deleteResult = await User.updateMany(
      { 
        _id: { $in: existingUserIds },
        isDeleted: { $ne: true }
      },
      { 
        isDeleted: true, 
        deletedAt: new Date() 
      }
    );

    // Remove refresh tokens for deleted users
    for (const userId of existingUserIds) {
      await redisClient.del(`refreshToken:${userId}`);
    }

    return successResponse(res, "Users bulk deleted successfully", {
      deletedCount: deleteResult.modifiedCount,
      deletedUsers: existingUsers.map(user => ({
        _id: user._id,
        fullName: user.fullName,
        email: user.email
      })),
      notFound: notFoundIds
    }, null, 200, deleteResult.modifiedCount);
  } catch (err) {
    console.error("Bulk delete users error:", err);
    return errorResponse(res, err.message || "Server error", 500);
  }
};
export const deleteUserById = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { 
        isDeleted: true, 
        deletedAt: new Date() 
      },
      { new: true }
    ).select("-password");
    
    if (!user)
      return successResponse(res, "User not found", null, null, 200, 0);

    await redisClient.del(`refreshToken:${req.params.id}`);

    return successResponse(res, "User deleted successfully", { user }, null, 200, 1);
  } catch (err) {
    return errorResponse(res, err.message || "Server error", 500);
  }
};

/* ---------------- Admin: Restore Deleted User ---------------- */
export const restoreUserById = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { 
        isDeleted: false, 
        deletedAt: null 
      },
      { new: true }
    ).select("-password");
    
    if (!user)
      return successResponse(res, "User not found", null, null, 200, 0);

    return successResponse(res, "User restored successfully", { user }, null, 200, 1);
  } catch (err) {
    return errorResponse(res, err.message || "Server error", 500);
  }
};

/* ---------------- Admin: Get Deleted Users ---------------- */
export const getDeletedUsers = async (req, res) => {
  try {
    const users = await User.find({ isDeleted: true }).select("-password");
    return successResponse(res, "Deleted users fetched successfully", { users }, null, 200, 1);
  } catch (err) {
    return errorResponse(res, err.message || "Server error", 500);
  }
};

/* ---------------- Admin: Hard Delete User ---------------- */
export const hardDeleteUserById = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user)
      return successResponse(res, "User not found", null, null, 200, 0);

    await redisClient.del(`refreshToken:${req.params.id}`);

    return successResponse(res, "User permanently deleted successfully", null, null, 200, 1);
  } catch (err) {
    return errorResponse(res, err.message || "Server error", 500);
  }
};

/* ---------------- Refresh Access Token ---------------- */
export const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken)
      return successResponse(res, "Refresh token required", null, null, 400, 0);

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch {
      return successResponse(res, "Invalid or expired refresh token", null, null, 401, 0);
    }

    const storedToken = await redisClient.get(`refreshToken:${decoded.id}`);
    if (!storedToken || storedToken !== refreshToken)
      return successResponse(res, "Refresh token expired or revoked", null, null, 401, 0);

    const newAccessToken = jwt.sign({ id: decoded.id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    return successResponse(res, "Access token refreshed successfully", { accessToken: newAccessToken }, null, 200, 1);
  } catch (err) {
    return errorResponse(res, err.message || "Server error", 500);
  }
};
