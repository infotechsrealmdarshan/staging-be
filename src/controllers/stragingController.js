import mongoose from "mongoose";
import Straging from "../models/Straging.js";
import { upload } from "../middlewares/cloudinaryUpload.js";
import { successResponse, errorResponse } from "../utils/response.js";

// Admin: Get all straging projects
export const adminGetAll = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const query = search ? { projectName: { $regex: search, $options: "i" } } : {};

    const stragingProjects = await Straging.find(query)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Straging.countDocuments(query);

    // Transform each project to match required format
    const transformedProjects = stragingProjects.map(straging => {
      const areasWithData = straging.areas.map(area => {
        console.log('Processing area:', {
          areaId: area.areaId,
          areaId_type: typeof area.areaId,
          area_id: area._id.toString(),
          area_id_type: typeof area._id.toString()
        });

        console.log('Available hotspots:', straging.hotspots.map(h => ({
          hotspotId: h.hotspotId,
          parentAreaId: h.parentAreaId,
          parentAreaId_type: typeof h.parentAreaId
        })));

        const filteredHotspots = straging.hotspots.filter(
          h => h.parentAreaId === area._id.toString()
        );

        console.log('Filtered hotspots for this area:', filteredHotspots);

        return {
          ...area.toObject(),
          hotspots: filteredHotspots,
          info: straging.info.filter(
            i => i.areaId === area._id.toString()
          ),
          items: area.items || []
        };
      });

      return {
        project: {
          _id: straging._id,
          projectName: straging.projectName,
          streetAddress: straging.streetAddress,
          aptLandmark: straging.aptLandmark,
          cityLocality: straging.cityLocality,
          state: straging.state,
          country: straging.country,
          note: straging.note,
          items: straging.items || [],
          createdAt: straging.createdAt,
          updatedAt: straging.updatedAt,
          createdBy: straging.createdBy
        },
        areas: areasWithData
      };
    });

    return successResponse(res, "Your straging projects retrieved successfully", {
      straging: transformedProjects,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
      },
    });
  } catch (error) {
    errorResponse(res, "Error retrieving straging projects", 500);
  }
};

// Admin: Get straging project by ID
export const adminGetById = async (req, res) => {
  try {
    const { id } = req.params;
    const straging = await Straging.findById(id).populate("createdBy", "name email");

    if (!straging) {
      return errorResponse(res, "Straging project not found", 404);
    }

    // Transform data to match required format
    const areasWithData = straging.areas.map(area => {
      return {
        ...area.toObject(),
        hotspots: straging.hotspots.filter(
          h => h.parentAreaId === area.areaId
        ),
        info: straging.info.filter(
          i => i.areaId === area._id.toString()
        ),
        items: area.items || []
      };
    });

    return successResponse(res, "Straging project retrieved successfully", {
      project: {
        _id: straging._id,
        projectName: straging.projectName,
        streetAddress: straging.streetAddress,
        aptLandmark: straging.aptLandmark,
        cityLocality: straging.cityLocality,
        state: straging.state,
        country: straging.country,
        note: straging.note,
        items: straging.items || [],
        createdAt: straging.createdAt,
        updatedAt: straging.updatedAt,
        createdBy: straging.createdBy
      },
      areas: areasWithData
    });
  } catch (error) {
    errorResponse(res, "Error retrieving straging project", 500);
  }
};

// Admin: Delete straging project
export const adminDelete = async (req, res) => {
  try {
    const { id } = req.params;
    const straging = await Straging.findByIdAndDelete(id);

    if (!straging) {
      return errorResponse(res, "Straging project not found", 404);
    }

    res.json(successResponse(res, "Straging project deleted successfully", straging));
  } catch (error) {
    errorResponse(res, "Error deleting straging project", 500);
  }
};

// Admin: Bulk delete straging projects
export const adminBulkDelete = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return errorResponse(res, "Invalid IDs provided", 400);
    }

    const result = await Straging.deleteMany({ _id: { $in: ids } });

    res.json(successResponse(res, "Straging projects deleted successfully", {
      deletedCount: result.deletedCount,
    }));
  } catch (error) {
    errorResponse(res, "Error deleting straging projects", 500);
  }
};

// Public: View all straging projects (without token)
export const publicViewAll = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const query = search ? { projectName: { $regex: search, $options: "i" } } : {};

    const stragingProjects = await Straging.find(query)
      .select("projectName streetAddress cityLocality state country images createdAt info hotspots areas items")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Straging.countDocuments(query);

    // Transform each project to match required format
    const transformedProjects = stragingProjects.map(straging => {
      const areasWithData = straging.areas.map(area => {
        console.log('Processing area:', {
          areaId: area.areaId,
          areaId_type: typeof area.areaId,
          area_id: area._id.toString(),
          area_id_type: typeof area._id.toString()
        });

        console.log('Available hotspots:', straging.hotspots.map(h => ({
          hotspotId: h.hotspotId,
          parentAreaId: h.parentAreaId,
          parentAreaId_type: typeof h.parentAreaId
        })));

        const filteredHotspots = straging.hotspots.filter(
          h => h.parentAreaId === area._id.toString()
        );

        console.log('Filtered hotspots for this area:', filteredHotspots);

        return {
          ...area.toObject(),
          hotspots: filteredHotspots,
          info: straging.info.filter(
            i => i.areaId === area._id.toString()
          ),
          items: area.items || []
        };
      });

      return {
        project: {
          _id: straging._id,
          projectName: straging.projectName,
          streetAddress: straging.streetAddress,
          aptLandmark: straging.aptLandmark,
          cityLocality: straging.cityLocality,
          state: straging.state,
          country: straging.country,
          note: straging.note,
          items: straging.items || [],
          createdAt: straging.createdAt,
          updatedAt: straging.updatedAt
        },
        areas: areasWithData
      };
    });

    return successResponse(res, "Public straging projects retrieved successfully", {
      straging: transformedProjects,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
      },
    });
  } catch (error) {
    errorResponse(res, "Error retrieving straging projects", 500);
  }
};

// Public: Get straging project details (with hotspots and info)
export const publicGetById = async (req, res) => {
  try {
    const { id } = req.params;
    const straging = await Straging.findById(id)
      .select("projectName streetAddress cityLocality state country images note createdAt info hotspots areas items");

    if (!straging) {
      return errorResponse(res, "Straging project not found", 404);
    }

    // Transform data to match required format
    const areasWithData = straging.areas.map(area => {
      return {
        ...area.toObject(),
        hotspots: straging.hotspots.filter(
          h => h.parentAreaId === area.areaId
        ),
        info: straging.info.filter(
          i => i.areaId === area._id.toString()
        ),
        items: area.items || []
      };
    });

    return successResponse(res, "Straging project details retrieved successfully", {
      project: {
        _id: straging._id,
        projectName: straging.projectName,
        streetAddress: straging.streetAddress,
        aptLandmark: straging.aptLandmark,
        cityLocality: straging.cityLocality,
        state: straging.state,
        country: straging.country,
        note: straging.note,
        items: straging.items || [],
        createdAt: straging.createdAt,
        updatedAt: straging.updatedAt
      },
      areas: areasWithData
    });
  } catch (error) {
    return errorResponse(res, "Error retrieving straging project", 500);
  }
};

// User: Create new straging project
export const userCreate = async (req, res) => {
  try {
    console.log("Request body:", req.body);
    console.log("Request file:", req.file);
    console.log("User from auth:", req.user);

    const {
      projectName,
      streetAddress,
      aptLandmark,
      cityLocality,
      state,
      country,
      note,
    } = req.body;

    // Validate required fields
    if (!projectName || !streetAddress || !cityLocality || !state || !country) {
      return errorResponse(res, "Missing required fields", 400);
    }

    if (!req.user || !req.user.id) {
      return errorResponse(res, "User not authenticated", 401);
    }

    // Handle image from uploaded file
    let imageData = null;
    if (req.file) {
      imageData = {
        url: req.file.path || req.file.secure_url,
        public_id: req.file.filename || req.file.public_id,
        type: "capture",
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size
      };
    }

    const straging = new Straging({
      projectName,
      streetAddress,
      aptLandmark,
      cityLocality,
      state,
      country,
      note,
      ...imageData, // Spread image data directly (not in images array)
      createdBy: req.user.id,
    });

    console.log("Straging object before save:", straging);
    await straging.save();

    // Auto-create an area when project is created with an image
    if (imageData) {
      const autoArea = {
        id: `area_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        areaId: `area_${Date.now()}_${Math.random().toString(36).slice(2)}`, // Required field
        areaName: projectName, // Use project name as area name
        imageUrl: imageData.url,
        imagePublicId: imageData.public_id,
        imageName: imageData.originalName,
        imageType: imageData.mimeType ? imageData.mimeType.split('/')[1] : 'jpg',
        hotspotId: null,
        parent: false, // This area is created from project, not original parent
      };

      straging.areas = straging.areas || [];
      straging.areas.push(autoArea);
      await straging.save(); // Save again to add the area
    }

    await straging.populate("createdBy", "name email");

    // Get clean data without isOwn and parent fields
    const cleanData = straging.toJSON();

    res.status(201).json({
      statusCode: 201,
      status: 1,
      message: "Straging project created successfully",
      data: {
        ...cleanData, // Use clean data from toJSON transform
        // Add image fields directly to main data for frontend
        ...(imageData && {
          url: cleanData.url,
          public_id: cleanData.public_id,
          type: cleanData.type,
          originalName: cleanData.originalName,
          mimeType: cleanData.mimeType,
          size: cleanData.size
        })
      }
    });
  } catch (error) {
    console.error("Detailed error in userCreate:", error);
    errorResponse(res, "Error creating straging project", 500);
  }
};

// User: Update straging project
export const userUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      projectName,
      streetAddress,
      aptLandmark,
      cityLocality,
      state,
      country,
      note,
      images
    } = req.body;

    const straging = await Straging.findOneAndUpdate(
      { _id: id, createdBy: req.user.id },
      {
        projectName,
        streetAddress,
        aptLandmark,
        cityLocality,
        state,
        country,
        note,
        images,
      },
      { new: true, runValidators: true }
    ).populate("createdBy", "name email");

    if (!straging) {
      return errorResponse(res, "Straging project not found or unauthorized", 404);
    }

    return successResponse(res, "Straging project updated successfully", straging);
  } catch (error) {
    errorResponse(res, "Error updating straging project", 500);
  }
};

// Helper function to manage image fields based on area count
const manageImageFields = (straging) => {
  if (straging.areas && straging.areas.length > 1) {
    // If 2+ areas, move image fields from main to first area
    const firstArea = straging.areas[0];
    if (firstArea && !firstArea.imageUrl) {
      firstArea.imageUrl = straging.url;
      firstArea.imagePublicId = straging.public_id;
      firstArea.imageName = straging.originalName;
      firstArea.imageType = straging.mimeType ? straging.mimeType.split('/')[1] : 'jpg';

      // Remove image fields from main
      straging.url = undefined;
      straging.public_id = undefined;
      straging.type = undefined;
      straging.originalName = undefined;
      straging.mimeType = undefined;
      straging.size = undefined;
    }
  }
};

// Delete area and manage image fields
export const deleteArea = async (req, res) => {
  try {
    const { id, areaId } = req.params;

    const straging = await Straging.findOne({ _id: id, createdBy: req.user.id });
    if (!straging) {
      return errorResponse(res, "Straging project not found or unauthorized", 404);
    }

    const areaIndex = straging.areas.findIndex(area => area.id === areaId);
    if (areaIndex === -1) {
      return errorResponse(res, "Area not found", 404);
    }

    const deletedArea = straging.areas[areaIndex];

    // Remove the area
    straging.areas.splice(areaIndex, 1);

    // If deleted area was first area and there are still areas left
    if (areaIndex === 0 && straging.areas.length > 0) {
      // Move deleted area's image to new first area
      const newFirstArea = straging.areas[0];
      if (deletedArea.imageUrl && !newFirstArea.imageUrl) {
        newFirstArea.imageUrl = deletedArea.imageUrl;
        newFirstArea.imagePublicId = deletedArea.imagePublicId;
        newFirstArea.imageName = deletedArea.imageName;
        newFirstArea.imageType = deletedArea.imageType;
      }
    }

    // If only 1 area left, move its image to main project
    if (straging.areas.length === 1) {
      const lastArea = straging.areas[0];
      if (lastArea.imageUrl) {
        straging.url = lastArea.imageUrl;
        straging.public_id = lastArea.imagePublicId;
        straging.originalName = lastArea.imageName;
        straging.mimeType = lastArea.imageType ? `image/${lastArea.imageType}` : 'image/jpeg';
        straging.type = 'capture';
        straging.size = 0;

        // Remove image from area
        delete lastArea.imageUrl;
        delete lastArea.imagePublicId;
        delete lastArea.imageName;
        delete lastArea.imageType;
      }
    }

    await straging.save();

    return successResponse(res, "Area deleted successfully", deletedArea);
  } catch (err) {
    console.error("Delete area error:", err);
    return errorResponse(res, err.message || "Server error", 500);
  }
};

// User: Delete own straging project
export const userDelete = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, "Invalid project ID", 400);
    }

    const straging = await Straging.findOneAndDelete({ _id: id, createdBy: req.user.id });

    if (!straging) {
      return errorResponse(res, "Straging project not found or unauthorized", 404);
    }

    return successResponse(res, "Straging project deleted successfully", straging);
  } catch (error) {
    return errorResponse(res, "Error deleting straging project", 500);
  }
};

// User: Get own straging projects
export const userGetOwn = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const query = {
      createdBy: req.user.id,
      ...(search && { projectName: { $regex: search, $options: "i" } })
    };

    const stragingProjects = await Straging.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Straging.countDocuments(query);

    // Transform each project to match required format
    const transformedProjects = stragingProjects.map(straging => {
      const areasWithData = straging.areas.map(area => {
        console.log('Processing area:', {
          areaId: area.areaId,
          areaId_type: typeof area.areaId,
          area_id: area._id.toString(),
          area_id_type: typeof area._id.toString()
        });

        console.log('Available hotspots:', straging.hotspots.map(h => ({
          hotspotId: h.hotspotId,
          parentAreaId: h.parentAreaId,
          parentAreaId_type: typeof h.parentAreaId
        })));

        const filteredHotspots = straging.hotspots.filter(
          h => h.parentAreaId === area._id.toString()
        );

        console.log('Filtered hotspots for this area:', filteredHotspots);

        return {
          ...area.toObject(),
          hotspots: filteredHotspots,
          info: straging.info.filter(
            i => i.areaId === area._id.toString()
          ),
          items: area.items || []
        };
      });

      return {
        project: {
          _id: straging._id,
          projectName: straging.projectName,
          streetAddress: straging.streetAddress,
          aptLandmark: straging.aptLandmark,
          cityLocality: straging.cityLocality,
          state: straging.state,
          country: straging.country,
          note: straging.note,
          items: straging.items || [],
          createdAt: straging.createdAt,
          updatedAt: straging.updatedAt,
          createdBy: straging.createdBy
        },
        areas: areasWithData
      };
    });

    return successResponse(res, "Your straging projects retrieved successfully", {
      straging: transformedProjects,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
      },
    });
  } catch (error) {
    errorResponse(res, "Error retrieving your straging projects", 500);
  }
};

// User: Get own straging project by ID
export const userGetOwnById = async (req, res) => {
  try {
    const { id } = req.params;
    const straging = await Straging.findOne({ _id: id, createdBy: req.user.id });

    if (!straging) {
      return errorResponse(res, "Straging project not found or unauthorized", 404);
    }

    // Clean up existing data - remove hotspots and info from images
    if (straging.images && straging.images.length > 0) {
      straging.images = straging.images.map(image => {
        const cleanImage = { ...image.toObject() };
        delete cleanImage.hotspots;
        delete cleanImage.info;
        return cleanImage;
      });

      // Save the cleaned data
      await straging.save();
    }

    // Transform data to match required format
    const areasWithData = straging.areas.map(area => {
      console.log('Processing area:', {
        areaId: area.areaId,
        areaId_type: typeof area.areaId,
        area_id: area._id.toString(),
        area_id_type: typeof area._id.toString()
      });

      console.log('Available hotspots:', straging.hotspots.map(h => ({
        hotspotId: h.hotspotId,
        parentAreaId: h.parentAreaId,
        parentAreaId_type: typeof h.parentAreaId
      })));

      const filteredHotspots = straging.hotspots.filter(
        h => h.parentAreaId === area._id.toString()
      );

      console.log('Filtered hotspots for this area:', filteredHotspots);

      return {
        ...area.toObject(),
        hotspots: filteredHotspots,
        info: straging.info.filter(
          i => i.areaId === area._id.toString()
        ),
        items: area.items || []
      };
    });

    return successResponse(res, "Straging project retrieved successfully", {
      project: {
        _id: straging._id,
        projectName: straging.projectName,
        streetAddress: straging.streetAddress,
        aptLandmark: straging.aptLandmark,
        cityLocality: straging.cityLocality,
        state: straging.state,
        country: straging.country,
        note: straging.note,
        items: straging.items || [],
        createdAt: straging.createdAt,
        updatedAt: straging.updatedAt,
        createdBy: straging.createdBy
      },
      areas: areasWithData
    });
  } catch (error) {
    return errorResponse(res, "Error retrieving straging project", 500);
  }
};

// Add area with image
export const addArea = async (req, res) => {
  try {
    const { id } = req.params;
    const { areaName } = req.body;

    if (!areaName) {
      return errorResponse(res, "Area name is required", 400);
    }

    if (!req.file) {
      return errorResponse(res, "Image is required for area", 400);
    }

    const straging = await Straging.findOne({ _id: id, createdBy: req.user.id });
    if (!straging) {
      return errorResponse(res, "Straging not found", 404);
    }

    // Areas can have same names, no need to check for duplicates

    // Create new area with image (no auto-creation of hotspot)
    const newArea = {
      id: `area_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      areaId: `area_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Required field by schema
      areaName: areaName.trim(),
      imageUrl: req.file.path || req.file.secure_url,
      imagePublicId: req.file.filename || req.file.public_id,
      imageName: req.file.originalname,
      imageType: req.file.mimetype.split('/')[1] || 'png',
      hotspotId: null,
      parent: true, // This is original parent area
    };

    straging.areas = straging.areas || [];
    straging.areas.push(newArea);

    // Update straging isOwn to false when adding areas through API
    straging.isOwn = false;

    // Manage image fields based on area count
    manageImageFields(straging);

    await straging.save();

    return successResponse(res, "Area added successfully", {
      ...newArea,
      parent: true, // Explicitly show parent status in response
    });
  } catch (err) {
    console.error("Add area error:", err);
    return errorResponse(res, err.message || "Server error", 500);
  }
};

// Get all areas for a straging
export const getAreas = async (req, res) => {
  try {
    const { id } = req.params;

    const straging = await Straging.findOne({ _id: id, createdBy: req.user.id });
    if (!straging) {
      return errorResponse(res, "Straging not found", 404);
    }

    return successResponse(res, "Areas retrieved successfully", straging.areas || []);
  } catch (err) {
    console.error("Get areas error:", err);
    return errorResponse(res, err.message || "Server error", 500);
  }
};

// Add info only to a specific area (areaId from URL)
export const addInfoOnly = async (req, res) => {
  try {
    const { id, areaId } = req.params; // ✅ areaId from URL
    const { description, x, y } = req.body;

    if (!description) {
      return errorResponse(res, "Description is required", 400);
    }

    const straging = await Straging.findOne({
      _id: id,
      createdBy: req.user.id
    });

    if (!straging) {
      return errorResponse(res, "Straging not found", 404);
    }

    const targetArea = straging.areas.find(a => a.areaId === areaId || a.id === areaId);
    if (!targetArea) {
      return errorResponse(res, "Area not found", 404);
    }

    // Check if info already exists at same position
    const existingInfo = straging.info.find(i =>
      i.areaId === targetArea._id.toString() &&
      ((typeof i.x === 'string' ? parseFloat(i.x) : i.x) === parseFloat(x)) &&
      ((typeof i.y === 'string' ? parseFloat(i.y) : i.y) === parseFloat(y))
    );

    const newInfo = {
      id: `info_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      description: description.trim(),
      x: x !== undefined ? parseFloat(x) : 0,
      y: y !== undefined ? parseFloat(y) : 0,
      areaId: targetArea._id.toString() // Use area's _id for proper relation
    };

    straging.info = straging.info || [];

    if (existingInfo) {
      // Update existing info
      existingInfo.description = description.trim();
      existingInfo.x = x !== undefined ? parseFloat(x) : 0;
      existingInfo.y = y !== undefined ? parseFloat(y) : 0;
    } else {
      // Add new info
      straging.info.push(newInfo);
    }

    straging.isOwn = false;
    await straging.save();

    return successResponse(res, "Info added successfully", newInfo);
  } catch (err) {
    console.error("Add info error:", err);
    return errorResponse(res, err.message || "Server error", 500);
  }
};


// Add hotspot to a specific area (areaId from URL)
export const addHotspotOnly = async (req, res) => {
  try {
    const { id, areaId } = req.params; // ✅ areaId from URL
    const { x, y, title, createArea } = req.body;

    if (!x || !y || !title) {
      return errorResponse(res, "x, y and title are required", 400);
    }

    if (!req.file) {
      return errorResponse(res, "Image is required for hotspot", 400);
    }

    const straging = await Straging.findOne({
      _id: id,
      createdBy: req.user.id
    });

    if (!straging) {
      return errorResponse(res, "Straging not found", 404);
    }

    const parentArea = straging.areas.find(a =>
      a.areaId === areaId ||
      a._id.toString() === areaId ||
      a.id === areaId
    );

    if (!parentArea) {
      console.log("Failed to find parent area:", {
        requestedId: areaId,
        availableAreas: straging.areas.map(a => ({ areaId: a.areaId, _id: a._id }))
      });
      return errorResponse(res, "Parent area not found", 404);
    }

    let childArea = null;

    // 🔁 Check if area with same name already exists
    const existingArea = straging.areas.find(a => a.areaName.toLowerCase() === title.trim().toLowerCase());

    if (existingArea) {
      // Use existing area
      childArea = existingArea;

      // Update existing area image
      childArea.imageUrl = req.file.path || req.file.secure_url;
      childArea.imagePublicId = req.file.filename || req.file.public_id;
      childArea.imageName = req.file.originalname;
      childArea.imageType = req.file.mimetype.split("/")[1] || "jpg";
    } else {
      // Create new area opened by hotspot
      const newAreaId = `area_${Date.now()}_${Math.random().toString(36).slice(2)}`;

      childArea = {
        areaId: newAreaId,
        areaName: title.trim(),

        imageUrl: req.file.path || req.file.secure_url,
        imagePublicId: req.file.filename || req.file.public_id,
        imageName: req.file.originalname,
        imageType: req.file.mimetype.split("/")[1] || "jpg",

        parentHotspotId: null
      };

      straging.areas.push(childArea);
    }

    // Check if hotspot with same title already exists in this area
    const existingHotspot = straging.hotspots.find(h =>
      (h.parentAreaId === parentArea._id.toString() || h.parentAreaId === areaId) &&
      h.title.toLowerCase() === title.trim().toLowerCase()
    );

    let newHotspot;
    if (existingHotspot) {
      // Update existing hotspot
      existingHotspot.x = parseFloat(x);
      existingHotspot.y = parseFloat(y);
      existingHotspot.imageUrl = req.file.path || req.file.secure_url;
      existingHotspot.imagePublicId = req.file.filename || req.file.public_id;
      existingHotspot.imageName = req.file.originalname;
      existingHotspot.imageType = req.file.mimetype.split("/")[1] || "jpg";
      existingHotspot.childAreaId = childArea ? childArea.areaId : null;

      newHotspot = existingHotspot;
    } else {
      // Create new hotspot
      newHotspot = {
        hotspotId: `hotspot_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        title: title.trim(),
        x: parseFloat(x),
        y: parseFloat(y),

        imageUrl: req.file.path || req.file.secure_url,
        imagePublicId: req.file.filename || req.file.public_id,
        imageName: req.file.originalname,
        imageType: req.file.mimetype.split("/")[1] || "jpg",

        parentAreaId: parentArea._id.toString(),
        childAreaId: childArea ? childArea.areaId : null
      };

      straging.hotspots.push(newHotspot);
    }

    // 🔗 Link child area back to hotspot
    if (childArea) {
      childArea.parentHotspotId = newHotspot.hotspotId;
    }

    straging.isOwn = false;
    await straging.save();

    return successResponse(res, "Hotspot added successfully", {
      hotspot: newHotspot,
      area: childArea
    });
  } catch (err) {
    console.error("Add hotspot error:", err);
    return errorResponse(res, err.message || "Server error", 500);
  }
};



// Upload image with hotspot and info
export const uploadImageWithHotspotAndInfo = async (req, res) => {
  try {
    const { hotspot, info } = req.body;

    // File is optional - only process if uploaded
    let uploadResult = null;
    if (req.file) {
      uploadResult = req.file;
    }

    // Parse hotspot and info if provided
    let parsedHotspot = [];
    let parsedInfo = [];

    if (hotspot) {
      try {
        parsedHotspot = JSON.parse(hotspot);
      } catch (e) {
        return errorResponse(res, "Invalid hotspot data format", 400);
      }
    }

    if (info) {
      try {
        parsedInfo = JSON.parse(info);
      } catch (e) {
        return errorResponse(res, "Invalid info data format", 400);
      }
    }

    const imageData = uploadResult ? {
      url: uploadResult.path || uploadResult.secure_url,
      public_id: uploadResult.filename || uploadResult.public_id,
      type: "capture",
      originalName: uploadResult.originalname,
      mimeType: uploadResult.mimetype,
      size: uploadResult.size,
      hotspots: parsedHotspot,
      info: parsedInfo,
    } : {
      hotspots: parsedHotspot,
      info: parsedInfo,
    };

    return successResponse(res, "Data processed successfully", imageData);
  } catch (error) {
    errorResponse(res, "Error processing data", 500);
  }
};

// Add hotspot and info to existing image
export const addHotspotAndInfoToImage = async (req, res) => {
  try {
    const { stragingId, imageIndex } = req.params;
    const { hotspot, info } = req.body;

    const straging = await Straging.findOne({
      _id: stragingId,
      createdBy: req.user.id
    });

    if (!straging) {
      return errorResponse(res, "Straging project not found or unauthorized", 404);
    }

    if (!straging.images[imageIndex]) {
      return errorResponse(res, "Image not found", 404);
    }

    // Add hotspot and info to the specific image
    if (hotspot) {
      // Initialize hotspots array for this image if it doesn't exist
      if (!straging.images[imageIndex].hotspots) {
        straging.images[imageIndex].hotspots = [];
      }

      // Check if hotspot already exists in the main hotspots array
      const existingHotspotIds = straging.hotspots.map(h => h.id);

      // Only add hotspots that don't already exist in the main hotspots array
      const newHotspots = hotspot.filter(h => !existingHotspotIds.includes(h.id));

      if (newHotspots.length > 0) {
        straging.images[imageIndex].hotspots.push(...newHotspots);
      }
    }

    if (info) {
      // Initialize info array for this image if it doesn't exist
      if (!straging.images[imageIndex].info) {
        straging.images[imageIndex].info = [];
      }
      straging.images[imageIndex].info.push(...info);
    }

    await straging.save();

    res.json(successResponse(res, "Hotspot and info added successfully", straging.images[imageIndex]));
  } catch (error) {
    errorResponse(res, "Error adding hotspot and info", 500);
  }
};

// Delete area and hotspot together
export const deleteAreaAndHotspot = async (req, res) => {
  try {
    const { id } = req.params;
    const { areaId, hotspotId } = req.body;

    if (!areaId && !hotspotId) {
      return errorResponse(res, "Either areaId or hotspotId is required", 400);
    }

    const straging = await Straging.findOne({ _id: id, createdBy: req.user.id });
    if (!straging) {
      return errorResponse(res, "Straging not found", 404);
    }

    let deletedArea = null;
    let deletedHotspot = null;

    // If areaId is provided, find and delete the area and its associated hotspot
    if (areaId) {
      const areaIndex = straging.areas.findIndex(area => area.id === areaId);
      if (areaIndex !== -1) {
        deletedArea = straging.areas[areaIndex];

        // Find and delete the associated hotspot
        if (deletedArea.hotspotId) {
          const hotspotIndex = straging.hotspots.findIndex(hotspot => hotspot.id === deletedArea.hotspotId);
          if (hotspotIndex !== -1) {
            deletedHotspot = straging.hotspots[hotspotIndex];
            straging.hotspots.splice(hotspotIndex, 1);
          }
        }

        straging.areas.splice(areaIndex, 1);
      }
    }

    // If hotspotId is provided, find and delete the hotspot and its associated area
    if (hotspotId) {
      const hotspotIndex = straging.hotspots.findIndex(hotspot => hotspot.id === hotspotId);
      if (hotspotIndex !== -1) {
        deletedHotspot = straging.hotspots[hotspotIndex];

        // Find and delete the associated area
        if (deletedHotspot.areaId) {
          const areaIndex = straging.areas.findIndex(area => area.id === deletedHotspot.areaId);
          if (areaIndex !== -1) {
            deletedArea = straging.areas[areaIndex];
            straging.areas.splice(areaIndex, 1);
          }
        }

        straging.hotspots.splice(hotspotIndex, 1);
      }
    }

    if (!deletedArea && !deletedHotspot) {
      return errorResponse(res, "Area or hotspot not found", 404);
    }

    await straging.save();

    return successResponse(res, "Area and hotspot deleted successfully", {
      deletedArea,
      deletedHotspot
    });
  } catch (err) {
    console.error("Delete area and hotspot error:", err);
    return errorResponse(res, err.message || "Server error", 500);
  }
};

// Add item to project library
export const addProjectItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { areaId, x, y, rotation } = req.body;

    if (!req.file) return errorResponse(res, "Image is required", 400);

    const straging = await Straging.findOne({ _id: id, createdBy: req.user.id });
    if (!straging) return errorResponse(res, "Straging project not found", 404);

    const newItem = {
      itemId: `item_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      imageUrl: req.file.path || req.file.secure_url,
      imagePublicId: req.file.filename || req.file.public_id,
      imageName: req.file.originalname,
      imageType: req.file.mimetype.split("/")[1] || "jpg",
    };

    straging.items = straging.items || [];
    straging.items.push(newItem);

    // Automatic placement if areaId is provided
    let placedItem = null;
    if (areaId) {
      const area = straging.areas.find(a => a.areaId === areaId || a._id.toString() === areaId);
      if (area) {
        placedItem = {
          instanceId: `inst_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          itemId: newItem.itemId,
          x: x ? parseFloat(x) : 0,
          y: y ? parseFloat(y) : 0,
          rotation: rotation ? parseFloat(rotation) : 0,
          imageUrl: newItem.imageUrl
        };
        area.items = area.items || [];
        area.items.push(placedItem);
      }
    }

    await straging.save();

    return successResponse(res, "Item added to library successfully", {
      ...newItem,
      placedInArea: placedItem
    });
  } catch (error) {
    return errorResponse(res, "Error adding item to library", 500);
  }
};

// Add item to specific area
export const addAreaItem = async (req, res) => {
  try {
    const { id, areaId } = req.params;
    const { itemId, x, y, rotation } = req.body;

    if (!itemId) return errorResponse(res, "itemId is required", 400);

    const straging = await Straging.findOne({ _id: id, createdBy: req.user.id });
    if (!straging) return errorResponse(res, "Straging project not found", 404);

    const area = straging.areas.find(a => a.areaId === areaId || a._id.toString() === areaId);
    if (!area) return errorResponse(res, "Area not found", 404);

    const libraryItem = straging.items.find(i => i.itemId === itemId);
    if (!libraryItem) return errorResponse(res, "Item not found in library", 404);

    const newAreaItem = {
      instanceId: `inst_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      itemId: itemId,
      x: x || 0,
      y: y || 0,
      rotation: rotation || 0,
      imageUrl: libraryItem.imageUrl
    };

    area.items = area.items || [];
    area.items.push(newAreaItem);
    await straging.save();

    return successResponse(res, "Item added to area successfully", newAreaItem);
  } catch (error) {
    return errorResponse(res, "Error adding item to area", 500);
  }
};

// Delete item from library (cascades to all areas)
export const deleteProjectItem = async (req, res) => {
  try {
    const { id, itemId } = req.params;

    const straging = await Straging.findOne({ _id: id, createdBy: req.user.id });
    if (!straging) return errorResponse(res, "Straging project not found", 404);

    // Remove from library
    straging.items = straging.items.filter(i => i.itemId !== itemId);

    // Remove from all areas
    straging.areas.forEach(area => {
      area.items = (area.items || []).filter(ai => ai.itemId !== itemId);
    });

    await straging.save();
    return successResponse(res, "Item deleted from project and all areas successfully");
  } catch (error) {
    return errorResponse(res, "Error deleting item from project", 500);
  }
};

// Delete item from specific area
export const deleteAreaItem = async (req, res) => {
  try {
    const { id, areaId, instanceId } = req.params;

    const straging = await Straging.findOne({ _id: id, createdBy: req.user.id });
    if (!straging) return errorResponse(res, "Straging project not found", 404);

    const area = straging.areas.find(a => a.areaId === areaId || a._id.toString() === areaId);
    if (!area) return errorResponse(res, "Area not found", 404);

    area.items = (area.items || []).filter(ai => ai.instanceId !== instanceId);
    await straging.save();

    return successResponse(res, "Item deleted from area successfully");
  } catch (error) {
    return errorResponse(res, "Error deleting item from area", 500);
  }
};
