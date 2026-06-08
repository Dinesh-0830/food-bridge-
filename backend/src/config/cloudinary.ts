import { v2 as cloudinary } from 'cloudinary';

// Check if Cloudinary environment variables are set
const isCloudinaryConfigured = !!process.env.CLOUDINARY_URL;

if (isCloudinaryConfigured) {
  // Configured automatically via CLOUDINARY_URL environment variable
  console.log('Cloudinary service initialized.');
} else {
  console.log('Cloudinary not configured. Using local mock image uploads.');
}

/**
 * Uploads a file buffer or base64 to Cloudinary, or returns a mock image URL if not configured.
 * @param fileBuffer The file buffer or base64 string
 * @param folder Cloudinary folder name
 * @param type The context of upload ('food' or 'volunteer' or 'proof')
 */
export const uploadImage = async (
  fileBuffer?: Buffer | string,
  folder: string = 'foodbridge',
  type: 'food' | 'volunteer' | 'proof' = 'food'
): Promise<string> => {
  if (isCloudinaryConfigured && fileBuffer) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            resolve(result?.secure_url || '');
          }
        }
      );
      
      if (Buffer.isBuffer(fileBuffer)) {
        uploadStream.end(fileBuffer);
      } else {
        // base64 upload
        cloudinary.uploader.upload(fileBuffer, { folder })
          .then((res) => resolve(res.secure_url))
          .catch((err) => reject(err));
      }
    });
  }

  // Fallback mocks
  const foodImages = [
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500',
    'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=500',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500'
  ];

  const profileImages = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500',
    'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=500',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=500'
  ];

  const proofImages = [
    'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=500',
    'https://images.unsplash.com/photo-1544025162-d76694265947?w=500',
    'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=500'
  ];

  if (type === 'volunteer') {
    return profileImages[Math.floor(Math.random() * profileImages.length)];
  } else if (type === 'proof') {
    return proofImages[Math.floor(Math.random() * proofImages.length)];
  } else {
    return foodImages[Math.floor(Math.random() * foodImages.length)];
  }
};
