/**
 * Generate short Cloudinary URL
 * @param {string} cloudinaryUrl - Full Cloudinary URL
 * @returns {string} - Shortened URL
 */
export const getShortCloudinaryUrl = (cloudinaryUrl) => {
  if (!cloudinaryUrl || !cloudinaryUrl.includes('cloudinary')) {
    return cloudinaryUrl;
  }

  try {
    // Extract public_id from Cloudinary URL
    const urlParts = cloudinaryUrl.split('/upload/');
    if (urlParts.length < 2) return cloudinaryUrl;

    const baseUrl = urlParts[0] + '/upload/';
    const fileNameWithVersion = urlParts[1];
    
    // Remove version number and get clean filename
    const cleanFileName = fileNameWithVersion.replace(/^v\d+\//, '');
    
    return baseUrl + cleanFileName;
  } catch (error) {
    console.error('Error shortening Cloudinary URL:', error);
    return cloudinaryUrl;
  }
};

/**
 * Generate optimized short URL with transformations
 * @param {string} cloudinaryUrl - Full Cloudinary URL
 * @param {Object} options - Transformation options
 * @returns {string} - Optimized short URL
 */
export const getOptimizedShortUrl = (cloudinaryUrl, options = {}) => {
  if (!cloudinaryUrl || !cloudinaryUrl.includes('cloudinary')) {
    return cloudinaryUrl;
  }

  try {
    const urlParts = cloudinaryUrl.split('/upload/');
    if (urlParts.length < 2) return cloudinaryUrl;

    const baseUrl = urlParts[0] + '/upload/';
    const fileNameWithVersion = urlParts[1];
    
    // Remove version number and get clean filename
    const cleanFileName = fileNameWithVersion.replace(/^v\d+\//, '');
    
    // Add transformations
    const transformations = [];
    if (options.width) transformations.push(`w_${options.width}`);
    if (options.height) transformations.push(`h_${options.height}`);
    if (options.quality) transformations.push(`q_${options.quality}`);
    if (options.crop) transformations.push(`c_${options.crop}`);
    
    const transformString = transformations.length > 0 ? transformations.join(',') + '/' : '';
    
    return baseUrl + transformString + cleanFileName;
  } catch (error) {
    console.error('Error generating optimized short URL:', error);
    return cloudinaryUrl;
  }
};

/**
 * Get thumbnail URL from Cloudinary URL
 * @param {string} cloudinaryUrl - Full Cloudinary URL
 * @param {number} width - Thumbnail width
 * @param {number} height - Thumbnail height
 * @returns {string} - Thumbnail URL
 */
export const getThumbnailUrl = (cloudinaryUrl, width = 200, height = 200) => {
  return getOptimizedShortUrl(cloudinaryUrl, {
    width,
    height,
    crop: 'fill',
    quality: 'auto:good'
  });
};
