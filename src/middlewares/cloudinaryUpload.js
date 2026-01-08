import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import { CloudinaryStorage } from "multer-storage-cloudinary";

// 📸 Cloudinary Storage Configuration
const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: (req, file) => {
      // Determine folder based on route or request type
      if (req.originalUrl && req.originalUrl.includes('/straging')) {
        return 'straging';
      } else if (req.originalUrl && req.originalUrl.includes('/panoramas')) {
        return 'panoramas';
      }
      return 'general';
    },
    format: async (req, file) => {
      // Keep original format or convert to webp for better optimization
      return file.mimetype.split('/')[1] || 'jpg';
    },
    public_id: (req, file) => {
      // Generate shorter, cleaner public ID
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 8);
      return `img_${timestamp}_${random}`;
    },
    resource_type: 'auto',
    transformation: [
      { quality: 'auto:good', fetch_format: 'auto' }
    ]
  },
});

// 🧩 File filter for images and videos
const imageFileFilter = (req, file, cb) => {
  if (typeof file.mimetype === "string" && 
      (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/"))) {
    cb(null, true);
  } else {
    cb(new Error("Only image and video files are allowed!"), false);
  }
};

// 🚀 Multer middleware exports with Cloudinary storage
const upload = multer({
  storage: cloudinaryStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit for images and videos
});

const uploadPanorama = multer({
  storage: cloudinaryStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 200 * 1024 * 1024, // 200MB limit for panorama images/videos
    files: 1
  }
});

const uploadStraging = multer({
  storage: cloudinaryStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for straging images/videos
    files: 10 // Allow up to 10 images/videos
  }
});

export { upload, uploadPanorama, uploadStraging };
