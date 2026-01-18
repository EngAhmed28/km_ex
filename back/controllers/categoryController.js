import pool from '../config/database.js';

// Get all categories
export const getAllCategories = async (req, res) => {
  try {
    const { is_active, show_all } = req.query;
    
    let query = 'SELECT id, name, name_en as nameEn, description, image_url as image, slug, is_active as isActive, created_at, updated_at FROM categories WHERE 1=1';
    const params = [];
    
    // Only filter by is_active if explicitly requested, or if show_all is not true
    if (is_active !== undefined) {
      query += ' AND is_active = ?';
      params.push(is_active === 'true' || is_active === '1');
    } else if (show_all !== 'true') {
      // By default, show only active categories for public routes
      // But if show_all=true (admin route), show all categories
      query += ' AND is_active = 1';
    }
    
    query += ' ORDER BY created_at DESC';
    
    const [categories] = await pool.execute(query, params);
    
    // Format for frontend compatibility - return raw data for admin
    const formattedCategories = categories.map(cat => ({
      id: cat.id,
      name: cat.name || '',
      name_en: cat.nameEn || cat.name || '',
      description: cat.description || '',
      image_url: cat.image || null,
      slug: cat.slug || `category-${cat.id}`,
      is_active: cat.isActive !== 0,
      created_at: cat.created_at,
      updated_at: cat.updated_at
    }));
    
    res.json({
      success: true,
      data: {
        categories: formattedCategories
      }
    });
  } catch (error) {
    console.error('Get all categories error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب الأقسام'
    });
  }
};

// Get category by ID
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [categories] = await pool.execute(
      'SELECT * FROM categories WHERE id = ?',
      [id]
    );
    
    if (categories.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'القسم غير موجود'
      });
    }
    
    res.json({
      success: true,
      data: {
        category: categories[0]
      }
    });
  } catch (error) {
    console.error('Get category by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب بيانات القسم'
    });
  }
};

// Create category (Admin only)
export const createCategory = async (req, res) => {
  try {
    const { name, name_en, description, image_url, is_active = true } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'اسم القسم مطلوب'
      });
    }
    
    // Generate slug from name_en or name
    const generateSlug = (text) => {
      const baseText = name_en || name;
      return baseText.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim() || `category-${Date.now()}`;
    };
    
    const slug = generateSlug(name);
    
    // Check if name or slug already exists
    const [existing] = await pool.execute(
      'SELECT id FROM categories WHERE name = ? OR slug = ?',
      [name, slug]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'القسم موجود بالفعل'
      });
    }
    
    console.log('🔄 Creating category with data:', { name, name_en, description, image_url, slug, is_active });
    
    const [result] = await pool.execute(
      'INSERT INTO categories (name, name_en, description, image_url, slug, is_active) VALUES (?, ?, ?, ?, ?, ?)',
      [name, name_en || name, description || null, image_url || null, slug, is_active]
    );
    
    console.log('✅ Category created with ID:', result.insertId);
    
    const [categories] = await pool.execute(
      'SELECT * FROM categories WHERE id = ?',
      [result.insertId]
    );
    
    console.log('✅ Category retrieved from DB:', categories[0]);
    console.log('📸 Image URL in DB:', categories[0]?.image_url);
    
    res.status(201).json({
      success: true,
      message: 'تم إنشاء القسم بنجاح',
      data: {
        category: categories[0]
      }
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء إنشاء القسم'
    });
  }
};

// Update category (Admin only)
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, name_en, description, image_url, is_active } = req.body;
    
    // Build update query dynamically
    const updates = [];
    const values = [];
    
    if (name) {
      updates.push('name = ?');
      values.push(name);
    }
    
    if (name_en !== undefined) {
      updates.push('name_en = ?');
      values.push(name_en);
    }
    
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    
    if (image_url !== undefined) {
      updates.push('image_url = ?');
      values.push(image_url);
    }
    
    if (is_active !== undefined) {
      updates.push('is_active = ?');
      values.push(is_active);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'لا توجد بيانات للتحديث'
      });
    }
    
    values.push(id);
    
    await pool.execute(
      `UPDATE categories SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
    
    const [categories] = await pool.execute(
      'SELECT * FROM categories WHERE id = ?',
      [id]
    );
    
    res.json({
      success: true,
      message: 'تم تحديث القسم بنجاح',
      data: {
        category: categories[0]
      }
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تحديث القسم'
    });
  }
};

// Delete category (Admin only)
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if category has products
    const [products] = await pool.execute(
      'SELECT COUNT(*) as count FROM products WHERE category_id = ?',
      [id]
    );
    
    if (products[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: 'لا يمكن حذف القسم لأنه يحتوي على منتجات'
      });
    }
    
    await pool.execute('DELETE FROM categories WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'تم حذف القسم بنجاح'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء حذف القسم'
    });
  }
};

// Toggle category status (Admin only)
export const toggleCategoryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get current status
    const [categories] = await pool.execute(
      'SELECT is_active FROM categories WHERE id = ?',
      [id]
    );
    
    if (categories.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'القسم غير موجود'
      });
    }
    
    const newStatus = !categories[0].is_active;
    
    await pool.execute(
      'UPDATE categories SET is_active = ? WHERE id = ?',
      [newStatus, id]
    );
    
    res.json({
      success: true,
      message: newStatus ? 'تم تفعيل القسم بنجاح' : 'تم تعطيل القسم بنجاح',
      data: {
        is_active: newStatus
      }
    });
  } catch (error) {
    console.error('Toggle category status error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تغيير حالة القسم'
    });
  }
};
