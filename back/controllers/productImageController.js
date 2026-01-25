import pool from '../config/database.js';

// Get all images for a product
export const getProductImages = async (req, res) => {
  try {
    const { productId } = req.params;
    
    const [images] = await pool.execute(
      'SELECT * FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, display_order ASC, created_at ASC',
      [productId]
    );
    
    res.json({
      success: true,
      data: {
        images: images
      }
    });
  } catch (error) {
    console.error('Get product images error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب صور المنتج'
    });
  }
};

// Add image to product
export const addProductImage = async (req, res) => {
  try {
    const { productId } = req.params;
    const { image_url, is_primary = false, display_order = 0 } = req.body;
    
    if (!image_url) {
      return res.status(400).json({
        success: false,
        message: 'رابط الصورة مطلوب'
      });
    }
    
    // If this is set as primary, unset other primary images
    if (is_primary) {
      await pool.execute(
        'UPDATE product_images SET is_primary = FALSE WHERE product_id = ?',
        [productId]
      );
    }
    
    const [result] = await pool.execute(
      'INSERT INTO product_images (product_id, image_url, is_primary, display_order) VALUES (?, ?, ?, ?)',
      [productId, image_url, is_primary ? 1 : 0, display_order]
    );
    
    const [images] = await pool.execute(
      'SELECT * FROM product_images WHERE id = ?',
      [result.insertId]
    );
    
    res.status(201).json({
      success: true,
      message: 'تم إضافة الصورة بنجاح',
      data: {
        image: images[0]
      }
    });
  } catch (error) {
    console.error('Add product image error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء إضافة الصورة'
    });
  }
};

// Update product image
export const updateProductImage = async (req, res) => {
  try {
    const { imageId } = req.params;
    const { is_primary, display_order } = req.body;
    
    // Get product_id from image
    const [images] = await pool.execute(
      'SELECT product_id FROM product_images WHERE id = ?',
      [imageId]
    );
    
    if (images.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'الصورة غير موجودة'
      });
    }
    
    const productId = images[0].product_id;
    
    // If setting as primary, unset other primary images
    if (is_primary) {
      await pool.execute(
        'UPDATE product_images SET is_primary = FALSE WHERE product_id = ? AND id != ?',
        [productId, imageId]
      );
    }
    
    const updates = [];
    const params = [];
    
    if (is_primary !== undefined) {
      updates.push('is_primary = ?');
      params.push(is_primary ? 1 : 0);
    }
    
    if (display_order !== undefined) {
      updates.push('display_order = ?');
      params.push(display_order);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'لا توجد بيانات للتحديث'
      });
    }
    
    params.push(imageId);
    
    await pool.execute(
      `UPDATE product_images SET ${updates.join(', ')} WHERE id = ?`,
      params
    );
    
    const [updatedImages] = await pool.execute(
      'SELECT * FROM product_images WHERE id = ?',
      [imageId]
    );
    
    res.json({
      success: true,
      message: 'تم تحديث الصورة بنجاح',
      data: {
        image: updatedImages[0]
      }
    });
  } catch (error) {
    console.error('Update product image error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تحديث الصورة'
    });
  }
};

// Delete product image
export const deleteProductImage = async (req, res) => {
  try {
    const { imageId } = req.params;
    
    const [images] = await pool.execute(
      'SELECT id FROM product_images WHERE id = ?',
      [imageId]
    );
    
    if (images.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'الصورة غير موجودة'
      });
    }
    
    await pool.execute('DELETE FROM product_images WHERE id = ?', [imageId]);
    
    res.json({
      success: true,
      message: 'تم حذف الصورة بنجاح'
    });
  } catch (error) {
    console.error('Delete product image error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء حذف الصورة'
    });
  }
};

// Set primary image
export const setPrimaryImage = async (req, res) => {
  try {
    const { imageId } = req.params;
    
    // Get product_id from image
    const [images] = await pool.execute(
      'SELECT product_id FROM product_images WHERE id = ?',
      [imageId]
    );
    
    if (images.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'الصورة غير موجودة'
      });
    }
    
    const productId = images[0].product_id;
    
    // Unset all primary images for this product
    await pool.execute(
      'UPDATE product_images SET is_primary = FALSE WHERE product_id = ?',
      [productId]
    );
    
    // Set this image as primary
    await pool.execute(
      'UPDATE product_images SET is_primary = TRUE WHERE id = ?',
      [imageId]
    );
    
    res.json({
      success: true,
      message: 'تم تعيين الصورة كصورة رئيسية'
    });
  } catch (error) {
    console.error('Set primary image error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تعيين الصورة الرئيسية'
    });
  }
};
