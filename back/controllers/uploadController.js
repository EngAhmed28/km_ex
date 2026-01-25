import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Upload category image
export const uploadCategoryImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'لم يتم اختيار صورة'
      });
    }

    // Return the file URL
    const fileUrl = `/uploads/categories/${req.file.filename}`;
    
    res.json({
      success: true,
      message: 'تم رفع الصورة بنجاح',
      data: {
        url: fileUrl,
        filename: req.file.filename
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء رفع الصورة'
    });
  }
};

// Upload product image (single)
export const uploadProductImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'لم يتم اختيار صورة'
      });
    }

    // Return the file URL
    const fileUrl = `/uploads/products/${req.file.filename}`;
    
    res.json({
      success: true,
      message: 'تم رفع الصورة بنجاح',
      data: {
        url: fileUrl,
        filename: req.file.filename
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء رفع الصورة'
    });
  }
};

// Upload multiple product images
export const uploadProductImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'لم يتم اختيار صور'
      });
    }

    // Return array of file URLs
    const files = Array.isArray(req.files) ? req.files : [req.files];
    const uploadedFiles = files.map(file => ({
      url: `/uploads/products/${file.filename}`,
      filename: file.filename
    }));
    
    res.json({
      success: true,
      message: `تم رفع ${uploadedFiles.length} صورة بنجاح`,
      data: {
        images: uploadedFiles
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء رفع الصور'
    });
  }
};
