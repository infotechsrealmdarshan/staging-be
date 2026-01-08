import multer from "multer";
import path from "path";
import fs from "fs";

// 📂 Define upload folders
const baseUploadDir = path.resolve("uploads");
const panoramaUploadDir = path.join(baseUploadDir, "panoramas");
const stragingUploadDir = path.join(baseUploadDir, "straging");

// Ensure upload folders exist
[baseUploadDir, panoramaUploadDir, stragingUploadDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// 📸 Storage configurations
const defaultStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, baseUploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

const panoramaStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, panoramaUploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = `panorama-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

const stragingStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, stragingUploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = `straging-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

// 🧩 File filter for images
const imageFileFilter = (req, file, cb) => {
  if (typeof file.mimetype === "string" && file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

// 🚀 Multer middleware exports
const upload = multer({ 
  storage: defaultStorage, 
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit for regular uploads
});

const uploadPanorama = multer({ 
  storage: panoramaStorage, 
  fileFilter: imageFileFilter,
  limits: { 
    fileSize: 50 * 1024 * 1024, // 50MB limit for panorama images
    files: 1
  }
});

const uploadStraging = multer({
  storage: stragingStorage,
  fileFilter: imageFileFilter,
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1 // Only allow 1 file
  }
});

export { upload, uploadPanorama, uploadStraging };
