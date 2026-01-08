import cloudinary from '../config/cloudinary.js';

/**
 * Generate optimized image URL with transformations
 * @param {string} publicId - Cloudinary public_id
 * @param {Object} options - Transformation options
 * @returns {string} - Optimized image URL
 */
export const getOptimizedImageUrl = (publicId, options = {}) => {
  const defaultOptions = {
    quality: 'auto:good',
    fetch_format: 'auto',
    secure: true
  };
  
  const transformationOptions = { ...defaultOptions, ...options };
  
  return cloudinary.url(publicId, transformationOptions);
};

/**
 * Generate thumbnail URL
 * @param {string} publicId - Cloudinary public_id
 * @param {number} width - Thumbnail width (default: 200)
 * @param {number} height - Thumbnail height (default: 200)
 * @returns {string} - Thumbnail URL
 */
export const getThumbnailUrl = (publicId, width = 200, height = 200) => {
  return getOptimizedImageUrl(publicId, {
    width,
    height,
    crop: 'fill',
    gravity: 'auto'
  });
};

/**
 * Generate responsive image URL
 * @param {string} publicId - Cloudinary public_id
 * @param {number} maxWidth - Maximum width
 * @returns {string} - Responsive image URL
 */
export const getResponsiveImageUrl = (publicId, maxWidth = 1200) => {
  return getOptimizedImageUrl(publicId, {
    width: maxWidth,
    crop: 'limit',
    gravity: 'auto'
  });
};

/**
 * Delete multiple images from Cloudinary
 * @param {Array} images - Array of image objects with public_id
 * @returns {Promise} - Promise that resolves when all images are deleted
 */
export const deleteMultipleImages = async (images) => {
  const deletePromises = images.map(async (img) => {
    if (img.public_id) {
      try {
        await cloudinary.uploader.destroy(img.public_id);
        return { success: true, public_id: img.public_id };
      } catch (error) {
        console.error(`Failed to delete image ${img.public_id}:`, error);
        return { success: false, public_id: img.public_id, error };
      }
    }
    return { success: true, public_id: null };
  });
  
  return Promise.all(deletePromises);
};

/**
 * Upload image with custom transformations
 * @param {File} file - Image file
 * @param {Object} options - Upload options
 * @returns {Promise} - Promise that resolves with upload result
 */
export const uploadImageWithTransformations = async (file, options = {}) => {
  const defaultOptions = {
    folder: 'straging',
    quality: 'auto:good',
    fetch_format: 'auto',
    resource_type: 'auto'
  };
  
  const uploadOptions = { ...defaultOptions, ...options };
  
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
    
    // Handle both buffer and stream
    if (file.buffer) {
      uploadStream.end(file.buffer);
    } else {
      file.pipe(uploadStream);
    }
  });
};
