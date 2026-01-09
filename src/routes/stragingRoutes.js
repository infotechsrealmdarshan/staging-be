import express from "express";
import {
  adminGetAll,
  adminGetById,
  adminDelete,
  adminBulkDelete,
  publicViewAll,
  publicGetById,
  userCreate,
  userUpdate,
  userDelete,
  userGetOwn,
  userGetOwnById,
  uploadImageWithHotspotAndInfo,
  addHotspotAndInfoToImage,
  addInfoOnly,
  addHotspotOnly,
  addArea,
  getAreas,
  deleteArea,
  deleteAreaAndHotspot,
  addProjectItem,
  addAreaItem,
  deleteProjectItem,
  deleteAreaItem,
  updateAreaItem,
} from "../controllers/stragingController.js";
import auth from "../middlewares/auth.js";
import { adminAuth } from "../middlewares/adminAuth.js";
import { upload } from "../middlewares/cloudinaryUpload.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Straging
 *   description: Straging project management APIs
 */

// ==================== PUBLIC ROUTES (NO AUTHENTICATION) ====================

/**
 * @swagger
 * /api/straging/public:
 *   get:
 *     summary: Get all public straging projects
 *     tags: [Straging]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by project name
 *     responses:
 *       200:
 *         description: Public straging projects retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Public straging projects retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     straging:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           projectName:
 *                             type: string
 *                           streetAddress:
 *                             type: string
 *                           cityLocality:
 *                             type: string
 *                           state:
 *                             type: string
 *                           country:
 *                             type: string
 *                           images:
 *                             type: array
 *                           createdAt:
 *                             type: string
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                         totalItems:
 *                           type: integer
 */
router.get("/public", publicViewAll);

/**
 * @swagger
 * /api/straging/public/{id}:
 *   get:
 *     summary: Get public straging project details
 *     tags: [Straging]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Straging project ID
 *     responses:
 *       200:
 *         description: Straging project details retrieved successfully
 *       404:
 *         description: Straging project not found
 */
router.get("/public/:id", publicGetById);

// ==================== ADMIN ROUTES ====================

/**
 * @swagger
 * /api/straging/admin/all:
 *   get:
 *     summary: Admin get all straging projects
 *     tags: [Straging Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: All straging projects retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.get("/admin/all", auth, adminAuth, adminGetAll);

/**
 * @swagger
 * /api/straging/admin/{id}:
 *   get:
 *     summary: Admin get straging project by ID
 *     tags: [Straging Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Straging project retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Straging project not found
 */
router.get("/admin/:id", auth, adminAuth, adminGetById);

/**
 * @swagger
 * /api/straging/admin/{id}:
 *   delete:
 *     summary: Admin delete straging project
 *     tags: [Straging Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Straging project deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Straging project not found
 */
router.delete("/admin/:id", auth, adminAuth, adminDelete);

/**
 * @swagger
 * /api/straging/admin/bulk:
 *   delete:
 *     summary: Admin bulk delete straging projects
 *     tags: [Straging Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ids
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of straging project IDs to delete
 *                 example: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
 *     responses:
 *       200:
 *         description: Straging projects deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Straging projects deleted successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     deletedCount:
 *                       type: integer
 *                       example: 2
 *       400:
 *         description: Invalid IDs provided
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.delete("/admin/bulk", auth, adminAuth, adminBulkDelete);

// ==================== USER ROUTES ====================

/**
 * @swagger
 * /api/straging/user:
 *   get:
 *     summary: Get user's own straging projects
 *     tags: [Straging User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User's straging projects retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/user", auth, userGetOwn);

/**
 * @swagger
 * /api/straging/user/{id}:
 *   get:
 *     summary: Get user's own straging project by ID
 *     tags: [Straging User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Straging project retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Straging project not found or unauthorized
 */
router.get("/user/:id", auth, userGetOwnById);

/**
 * @swagger
 * /api/straging:
 *   post:
 *     summary: Create new straging project
 *     tags: [Straging User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - projectName
 *               - streetAddress
 *               - cityLocality
 *               - state
 *               - country
 *             properties:
 *               projectName:
 *                 type: string
 *                 description: "Project name"
 *                 example: "Modern Villa"
 *               streetAddress:
 *                 type: string
 *                 description: "Street address"
 *                 example: "123 Main Street"
 *               aptLandmark:
 *                 type: string
 *                 description: "Apartment/Landmark (optional)"
 *                 example: "Apt 4B"
 *               cityLocality:
 *                 type: string
 *                 description: "City/Locality"
 *                 example: "New York"
 *               state:
 *                 type: string
 *                 description: "State"
 *                 example: "NY"
 *               country:
 *                 type: string
 *                 description: "Country"
 *                 example: "USA"
 *               note:
 *                 type: string
 *                 description: "Additional notes (optional)"
 *                 example: "Beautiful view of city"
 *               images:
 *                 type: string
 *                 format: binary
 *                 description: "Single image file to upload (optional)"
 *     responses:
 *       201:
 *         description: Straging project created successfully
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Unauthorized
 */
router.post("/", auth, upload.single("images"), userCreate);

/**
 * @swagger
 * /api/straging/{id}:
 *   put:
 *     summary: Update straging project
 *     tags: [Straging User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               projectName:
 *                 type: string
 *               streetAddress:
 *                 type: string
 *               aptLandmark:
 *                 type: string
 *               cityLocality:
 *                 type: string
 *               state:
 *                 type: string
 *               country:
 *                 type: string
 *               note:
 *                 type: string
 *               images:
 *                 type: array
 *     responses:
 *       200:
 *         description: Straging project updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Straging project not found or unauthorized
 */
router.put("/:id", auth, userUpdate);

/**
 * @swagger
 * /api/straging/{id}:
 *   delete:
 *     summary: Delete straging project
 *     tags: [Straging User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Straging project deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Straging project not found or unauthorized
 */
router.delete("/:id", auth, userDelete);

// ==================== SEPARATE INFO AND HOTSPOT APIs ====================

// Add info to specific area by areaId
/**
 * @swagger
 * /api/straging/{id}/areas/{areaId}/info:
 *   post:
 *     summary: Add info to specific area
 *     tags: [Straging Enhanced]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           description: Straging project ID
 *       - in: path
 *         name: areaId
 *         required: true
 *         schema:
 *           type: string
 *           description: Area ID to add info to
 *           example: "area_1641567890123_abc123def"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *                 description: "Description text"
 *                 example: "This is a beautiful modern home..."
 *               x:
 *                 type: number
 *                 description: "X coordinate position"
 *                 example: 150
 *               y:
 *                 type: number
 *                 description: "Y coordinate position"
 *                 example: 200
 *     responses:
 *       200:
 *         description: Info added successfully
 *       400:
 *         description: AreaId and description are required
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Straging project or area not found
 */
router.post("/:id/areas/:areaId/info", auth, addInfoOnly);

/**
 * @swagger
 * /api/straging/{id}/areas/{areaId}/hotspots:
 *   post:
 *     summary: Add hotspot to a specific area
 *     tags: [Straging Enhanced]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Straging project ID
 *       - in: path
 *         name: areaId
 *         required: true
 *         schema:
 *           type: string
 *         description: Area ID where hotspot will be added
 *         example: "area_1767786099875_2jyndhr9twx"
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - x
 *               - y
 *               - title
 *               - image
 *             properties:
 *               title:
 *                 type: string
 *                 description: Hotspot title/name
 *                 example: "Living Room"
 *               x:
 *                 type: number
 *                 description: X coordinate position
 *                 example: 100
 *               y:
 *                 type: number
 *                 description: Y coordinate position
 *                 example: 200
 *               createArea:
 *                 type: boolean
 *                 description: Create a new area opened by this hotspot
 *                 example: true
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Hotspot image (required)
 *     responses:
 *       200:
 *         description: Hotspot added successfully
 *       400:
 *         description: Missing required fields or image
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Straging project or area not found
 */
router.post(
  "/:id/areas/:areaId/hotspots",
  auth,
  upload.single("image"),
  addHotspotOnly
);


// ==================== AREA APIS ====================

/**
 * @swagger
 * /api/straging/{id}/areas:
 *   post:
 *     summary: Add area with image
 *     tags: [Straging Enhanced]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Straging project ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - areaName
 *               - image
 *             properties:
 *               areaName:
 *                 type: string
 *                 description: "Area name"
 *                 example: "Living Room"
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: "Area image (required)"
 *     responses:
 *       200:
 *         description: Area added successfully
 *       400:
 *         description: Missing required fields or image
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Straging project not found
 */
router.post("/:id/areas", auth, upload.single("image"), addArea);

/**
 * @swagger
 * /api/straging/{id}/areas:
 *   get:
 *     summary: Get all areas for a straging
 *     tags: [Straging Enhanced]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Straging project ID
 *     responses:
 *       200:
 *         description: Areas retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Areas retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "area_1641567890123_abc123def"
 *                       areaName:
 *                         type: string
 *                         example: "Living Room"
 *                       imageUrl:
 *                         type: string
 *                         example: "https://res.cloudinary.com/..."
 *                       imagePublicId:
 *                         type: string
 *                         example: "straging/area_123"
 *                       imageName:
 *                         type: string
 *                         example: "living-room.jpg"
 *                       imageType:
 *                         type: string
 *                         example: "jpeg"
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Straging project not found
 */
router.get("/:id/areas", auth, getAreas);

// ==================== IMAGE UPLOAD WITH HOTSPOT AND INFO ====================

/**
 * @swagger
 * /api/straging/upload-with-hotspot-info:
 *   post:
 *     summary: Upload image with hotspot and info
 *     tags: [Straging Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: "Image file to upload (optional)"
 *               hotspot:
 *                 type: string
 *                 description: "JSON string of hotspot data"
 *                 example: "[{\"x\":100,\"y\":200,\"title\":\"Living Room\",\"description\":\"Main area\"}]"
 *               info:
 *                 type: string
 *                 description: "JSON string of info data"
 *                 example: "[{\"title\":\"Project Info\",\"description\":\"Beautiful modern home\"}]"
 *     responses:
 *       200:
 *         description: Data processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Data processed successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                       example: "https://res.cloudinary.com/..."
 *                     public_id:
 *                       type: string
 *                       example: "straging/image_123"
 *                     type:
 *                       type: string
 *                       example: "capture"
 *                     originalName:
 *                       type: string
 *                       example: "photo.jpg"
 *                     mimeType:
 *                       type: string
 *                       example: "image/jpeg"
 *                     size:
 *                       type: integer
 *                       example: 1024000
 *                     hotspots:
 *                       type: array
 *                       items:
 *                         type: object
 *                     info:
 *                       type: array
 *                       items:
 *                         type: object
 *       400:
 *         description: Invalid data format
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/upload-with-hotspot-info",
  auth,
  upload.single("image"),
  uploadImageWithHotspotAndInfo
);

/**
 * @swagger
 * /api/straging/{stragingId}/images/{imageIndex}/hotspot-info:
 *   put:
 *     summary: Add hotspot and info to existing image
 *     tags: [Straging Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: stragingId
 *         required: true
 *         schema:
 *           type: string
 *         description: Straging project ID
 *       - in: path
 *         name: imageIndex
 *         required: true
 *         schema:
 *           type: integer
 *         description: Index of the image in the images array
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               hotspot:
 *                 type: array
 *                 description: "Array of hotspot objects"
 *                 items:
 *                   type: object
 *                   properties:
 *                     x:
 *                       type: number
 *                       example: 100
 *                     y:
 *                       type: number
 *                       example: 200
 *                     title:
 *                       type: string
 *                       example: "Living Room"
 *                     description:
 *                       type: string
 *                       example: "Main living area"
 *               info:
 *                 type: array
 *                 description: "Array of info objects"
 *                 items:
 *                   type: object
 *                   properties:
 *                     title:
 *                       type: string
 *                       example: "Project Details"
 *                     description:
 *                       type: string
 *                       example: "This is a beautiful modern home..."
 *     responses:
 *       200:
 *         description: Hotspot and info added successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Straging project or image not found
 */
router.put(
  "/:stragingId/images/:imageIndex/hotspot-info",
  auth,
  addHotspotAndInfoToImage
);

/**
 * @swagger
 * /api/straging/{id}/delete-area:
 *   delete:
 *     summary: Delete area and manage image fields
 *     tags: [Straging Enhanced]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Straging project ID
 *       - in: path
 *         name: areaId
 *         required: true
 *         schema:
 *           type: string
 *         description: Area ID to delete
 *     responses:
 *       200:
 *         description: Area deleted successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Straging project or area not found
 */
router.delete("/:id/areas/:areaId", auth, deleteArea);

/**
 * @swagger
 * /api/straging/{id}/delete-area-hotspot:
 *   delete:
 *     summary: Delete area and hotspot together
 *     tags: [Straging Enhanced]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Straging project ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               areaId:
 *                 type: string
 *                 description: "Area ID to delete (optional)"
 *                 example: "area_1641567890123_abc123def"
 *               hotspotId:
 *                 type: string
 *                 description: "Hotspot ID to delete (optional)"
 *                 example: "hotspot_1641567890123_xyz789uvw"
 *     responses:
 *       200:
 *         description: Area and hotspot deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Area and hotspot deleted successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     deletedArea:
 *                       type: object
 *                       description: "Deleted area object (if found)"
 *                     deletedHotspot:
 *                       type: object
 *                       description: "Deleted hotspot object (if found)"
 *       400:
 *         description: Either areaId or hotspotId is required
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Straging project, area, or hotspot not found
 */
router.delete("/:id/delete-area-hotspot", auth, deleteAreaAndHotspot);

// ==================== ITEM APIS ====================

/**
 * @swagger
 * /api/straging/{id}/items:
 *   post:
 *     summary: Add item to project library
 *     tags: [Straging Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Straging project ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: "Item image file (required)"
 *               width:
 *                 type: number
 *                 description: "Initial width of the item"
 *                 example: 300
 *               height:
 *                 type: number
 *                 description: "Initial height of the item"
 *                 example: 200
 *               flipX:
 *                 type: boolean
 *                 description: "Horizontal flip"
 *                 example: false
 *               flipY:
 *                 type: boolean
 *                 description: "Vertical flip"
 *                 example: false
 *     responses:
 *       200:
 *         description: Item added successfully
 *       400:
 *         description: Image is required
 *       404:
 *         description: Straging project not found
 */
router.post("/:id/items", auth, upload.single("image"), addProjectItem);

/**
 * @swagger
 * /api/straging/{id}/areas/{areaId}/items:
 *   post:
 *     summary: Place item in a specific area
 *     tags: [Straging Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Straging project ID
 *       - in: path
 *         name: areaId
 *         required: true
 *         schema:
 *           type: string
 *         description: Area ID where item will be placed
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - itemId
 *             properties:
 *               itemId:
 *                 type: string
 *               x:
 *                 type: number
 *               y:
 *                 type: number
 *               rotation:
 *                 type: number
 *                 description: Rotation in degrees
 *                 example: 90
 *               width:
 *                 type: number
 *                 description: Width of the item instance
 *                 example: 300
 *               height:
 *                 type: number
 *                 description: Height of the item instance
 *                 example: 200
 *               flipX:
 *                 type: boolean
 *                 description: Horizontal flip
 *                 example: false
 *               flipY:
 *                 type: boolean
 *                 description: Vertical flip
 *                 example: false
 *     responses:
 *       200:
 *         description: Item placed successfully
 *       400:
 *         description: itemId is required
 *       404:
 *         description: Straging project, area or library item not found
 */
router.post("/:id/areas/:areaId/items", auth, addAreaItem);

/**
 * @swagger
 * /api/straging/{id}/items/{itemId}:
 *   delete:
 *     summary: Delete item from library (cascades to all areas)
 *     tags: [Straging Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item deleted successfully
 *       404:
 *         description: Straging project not found
 */
router.delete("/:id/items/:itemId", auth, deleteProjectItem);

/**
 * @swagger
 * /api/straging/{id}/areas/{areaId}/items/{instanceId}:
 *   delete:
 *     summary: Delete specific item instance from an area
 *     tags: [Straging Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: areaId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: instanceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item instance deleted successfully
 *       404:
 *         description: Straging project or area not found
 */
router.delete("/:id/areas/:areaId/items/:instanceId", auth, deleteAreaItem);

/**
 * @swagger
 * /api/straging/{id}/areas/{areaId}/items/{instanceId}:
 *   put:
 *     summary: Update specific item instance in an area
 *     tags: [Straging Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: areaId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: instanceId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               x:
 *                 type: number
 *               y:
 *                 type: number
 *               rotation:
 *                 type: number
 *               width:
 *                 type: number
 *               height:
 *                 type: number
 *               flipX:
 *                 type: boolean
 *               flipY:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Item instance updated successfully
 *       404:
 *         description: Straging project, area or item instance not found
 */
router.put("/:id/areas/:areaId/items/:instanceId", auth, updateAreaItem);

export default router;
