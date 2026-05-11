/**
 * Utility for client-side image compression and optimization.
 * Helps reduce egress by ensuring images are resized and converted to WebP before upload.
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'image/webp' | 'image/jpeg';
}

/**
 * Compresses an image file using the Canvas API.
 * Returns a Blob that can be uploaded to Supabase Storage.
 */
export const compressImage = async (
  file: File,
  options: CompressionOptions = {}
): Promise<Blob | File> => {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.8,
    format = 'image/webp'
  } = options;

  // Don't try to compress non-images (like PDFs)
  if (!file.type.startsWith('image/')) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions maintaining aspect ratio
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Draw image to canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              // Create a new File from the Blob to maintain name (but change extension)
              const newFileName = file.name.replace(/\.[^/.]+$/, "") + (format === 'image/webp' ? '.webp' : '.jpg');
              const compressedFile = new File([blob], newFileName, {
                type: format,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Canvas toBlob failed'));
            }
          },
          format,
          quality
        );
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
    };
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Common configuration for different image types
 */
export const IMAGE_CONFIGS = {
  PRODUCT_MAIN: { maxWidth: 1200, quality: 0.8, format: 'image/webp' } as CompressionOptions,
  PRODUCT_GALLERY: { maxWidth: 1000, quality: 0.75, format: 'image/webp' } as CompressionOptions,
  AVATAR: { maxWidth: 400, quality: 0.8, format: 'image/webp' } as CompressionOptions,
  BLOG_COVER: { maxWidth: 1200, quality: 0.8, format: 'image/webp' } as CompressionOptions,
  PAGE_COVER: { maxWidth: 1600, quality: 0.8, format: 'image/webp' } as CompressionOptions,
};
