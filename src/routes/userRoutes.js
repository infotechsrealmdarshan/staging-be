import express from "express";
import auth from "../middlewares/auth.js";
import adminAuth from "../middlewares/adminAuth.js";
import {
  registerUser,
  loginUser,
  googleSignin,
  forgotPassword,
  getProfile,
  updateProfile,
  getAllUsers,
  getUserById,
  deleteUserById,
  deleteOwnAccount,
  refreshAccessToken,
  restoreUserById,
  bulkDeleteUsers,
} from "../controllers/userController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management operations
 */

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Register a new user with email and password
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - email
 *               - password
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: "John Doe"
 *                 description: User's full name
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 example: "Password123"
 *                 description: Password (min 8 chars, 1 uppercase, 1 lowercase, 1 number)
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "User registered successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                       description: JWT access token
 *                     user:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         fullName:
 *                           type: string
 *                         email:
 *                           type: string
 *                         authProvider:
 *                           type: string
 *                           enum: [email, google]
 *                         isEmailVerified:
 *                           type: boolean
 *                         createdAt:
 *                           type: string
 *                         updatedAt:
 *                           type: string
 *       400:
 *         description: Bad request - validation error or user already exists
 *       500:
 *         description: Internal server error
 */
router.post("/register", registerUser);

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Sign in with email and password
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 example: "Password123"
 *                 description: User's password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Login successful"
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                       description: JWT access token
 *                     user:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         fullName:
 *                           type: string
 *                         email:
 *                           type: string
 *                         mobile:
 *                           type: string
 *                         profileImg:
 *                           type: string
 *                         authProvider:
 *                           type: string
 *                         isEmailVerified:
 *                           type: boolean
 *                         createdAt:
 *                           type: string
 *                         updatedAt:
 *                           type: string
 *       400:
 *         description: Bad request - wrong auth provider
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Internal server error
 */
router.post("/login", loginUser);

/**
 * @swagger
 * /api/users/google-signin:
 *   post:
 *     summary: Sign in with Google OAuth
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idToken
 *             properties:
 *               idToken:
 *                 type: string
 *                 example: eyJhbGciOiJSUzI1NiIsImtpZCI6Ij...
 *                 description: Google ID token from client
 *     responses:
 *       200:
 *         description: Google sign in successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Google sign in successful"
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                       description: JWT access token
 *                     user:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         fullName:
 *                           type: string
 *                         email:
 *                           type: string
 *                         mobile:
 *                           type: string
 *                         profileImg:
 *                           type: string
 *                         authProvider:
 *                           type: string
 *                           enum: [google]
 *                         isEmailVerified:
 *                           type: boolean
 *                         createdAt:
 *                           type: string
 *                         updatedAt:
 *                           type: string
 *       400:
 *         description: Invalid Google ID token
 *       500:
 *         description: Internal server error
 */
router.post("/google-signin", googleSignin);

/**
 * @swagger
 * /api/users/forgot-password:
 *   post:
 *     summary: Send password reset link to email
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *                 description: User's email address
 *     responses:
 *       200:
 *         description: Password reset link sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Password reset link sent to your email"
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.post("/forgot-password", forgotPassword);

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get logged-in user's profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Profile retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         fullName:
 *                           type: string
 *                         email:
 *                           type: string
 *                         mobile:
 *                           type: string
 *                         profileImg:
 *                           type: string
 *                         authProvider:
 *                           type: string
 *                         isEmailVerified:
 *                           type: boolean
 *                         createdAt:
 *                           type: string
 *                         updatedAt:
 *                           type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.get("/profile", auth, getProfile);

/**
 * @swagger
 * /api/users/update:
 *   put:
 *     summary: Update user profile (no password change)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: "John Doe"
 *                 description: User's full name
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "newmail@example.com"
 *                 description: User's email address
 *               mobile:
 *                 type: string
 *                 example: "9876543210"
 *                 description: User's mobile number
 *               profileImg:
 *                 type: string
 *                 example: "/uploads/1762583119652-415612863.jpg"
 *                 description: Profile image URL
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Profile updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         fullName:
 *                           type: string
 *                         email:
 *                           type: string
 *                         mobile:
 *                           type: string
 *                         profileImg:
 *                           type: string
 *                         authProvider:
 *                           type: string
 *                         isEmailVerified:
 *                           type: boolean
 *                         createdAt:
 *                           type: string
 *                         updatedAt:
 *                           type: string
 *       400:
 *         description: Password updates not allowed in this route
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.put("/update", auth, updateProfile);

/**
 * @swagger
 * /api/users/delete:
 *   delete:
 *     summary: Delete own account (soft delete)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Account deleted successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         fullName:
 *                           type: string
 *                         email:
 *                           type: string
 *                         isDeleted:
 *                           type: boolean
 *                           example: true
 *                         deletedAt:
 *                           type: string
 *                           format: date-time
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.delete("/delete", auth, deleteOwnAccount);

/**
 * @swagger
 * /api/users/admin/all:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 100
 *         description: Number of users per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search users by name, email, or mobile
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, fullName, email]
 *           default: createdAt
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: All users fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "All users fetched successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           fullName:
 *                             type: string
 *                           email:
 *                             type: string
 *                           mobile:
 *                             type: string
 *                           profileImg:
 *                             type: string
 *                           authProvider:
 *                             type: string
 *                           isEmailVerified:
 *                             type: boolean
 *                           createdAt:
 *                             type: string
 *                           updatedAt:
 *                             type: string
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: integer
 *                           example: 1
 *                         totalPages:
 *                           type: integer
 *                           example: 5
 *                         totalCount:
 *                           type: integer
 *                           example: 50
 *                         limit:
 *                           type: integer
 *                           example: 10
 *                         hasNextPage:
 *                           type: boolean
 *                           example: true
 *                         hasPrevPage:
 *                           type: boolean
 *                           example: false
 *                         nextPage:
 *                           type: integer
 *                           example: 2
 *                         prevPage:
 *                           type: integer
 *                           example: null
 *       401:
 *         description: Unauthorized - Admin access required
 *       500:
 *         description: Server error
 */
router.get("/admin/all", adminAuth, getAllUsers);

/**
 * @swagger
 * /api/users/admin/{id}:
 *   get:
 *     summary: Get user by ID (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: User ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User details fetched successfully
 */
router.get("/admin/:id", adminAuth, getUserById);

/**
 * @swagger
 * /api/users/admin/{id}:
 *   delete:
 *     summary: Soft delete user by ID (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: User ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User soft deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "User deleted successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         fullName:
 *                           type: string
 *                         email:
 *                           type: string
 *                         isDeleted:
 *                           type: boolean
 *                           example: true
 *                         deletedAt:
 *                           type: string
 *                           format: date-time
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.delete("/admin/:id", adminAuth, deleteUserById);

/**
 * @swagger
 * /api/users/admin/{id}/restore:
 *   post:
 *     summary: Restore soft deleted user by ID (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: User ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User restored successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "User restored successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         fullName:
 *                           type: string
 *                         email:
 *                           type: string
 *                         isDeleted:
 *                           type: boolean
 *                           example: false
 *                         deletedAt:
 *                           type: string
 *                           nullable: true
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.post("/admin/:id/restore", adminAuth, restoreUserById);

/**
 * @swagger
 * /api/users/refresh:
 *   post:
 *     summary: Refresh access token using refresh token
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: New access token generated successfully
 *       401:
 *         description: Invalid or expired refresh token
 */
router.post("/refresh", refreshAccessToken);

/**
 * @swagger
 * /api/users/admin/bulk-delete:
 *   delete:
 *     summary: Bulk soft delete multiple users (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userIds
 *             properties:
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   pattern: '^[0-9a-fA-F]{24}$'
 *                 description: Array of user IDs to delete
 *                 example:
 *                   - "6957b2bb9a05f58836407a21"
 *                   - "6957b2bb9a05f58836407a22"
 *                   - "6957b2bb9a05f58836407a23"
 *                 minItems: 1
 *                 maxItems: 100
 *     responses:
 *       200:
 *         description: Users bulk deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Users bulk deleted successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     deletedCount:
 *                       type: integer
 *                       example: 3
 *                       description: Number of users successfully deleted
 *                     deletedUsers:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           fullName:
 *                             type: string
 *                           email:
 *                             type: string
 *                       description: Details of deleted users
 *                     notFound:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: User IDs that were not found
 *                       example: ["6957b2bb9a05f58836407a99"]
 *       400:
 *         description: Bad request - Invalid input or ID format
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "User IDs array is required"
 *                 error:
 *                   type: string
 *                   example: "Invalid user ID format detected"
 *       401:
 *         description: Unauthorized - Admin access required
 *       500:
 *         description: Server error
 */
router.delete("/admin/bulk-delete", adminAuth, bulkDeleteUsers);

export default router;
