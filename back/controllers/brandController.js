import pool from '../config/database.js';

// Get all brands
export const getAllBrands = async (req, res) => {
  try {
    const { is_active } = req.query;
    // Check if request is authenticated (has user from auth middleware or authorization header)
    const isAuthenticated = !!req.user || !!req.headers.authorization;
    
    let query = 'SELECT * FROM brands WHERE 1=1';
    const params = [];
    
    if (is_active !== undefined) {
      query += ' AND is_active = ?';
      params.push(is_active === 'true' || is_active === '1');
    } else if (!isAuthenticated) {
      // For public routes (not authenticated), show only active brands
      query += ' AND is_active = 1';
    }
    // For authenticated routes (admin), show all brands when is_active is not specified
    
    query += ' ORDER BY display_order ASC, created_at DESC';
    
    const [brands] = await pool.execute(query, params);
    
    res.json({
      success: true,
      data: {
        brands: brands.map(brand => ({
          ...brand,
          is_active: Boolean(brand.is_active)
        }))
      }
    });
  } catch (error) {
    console.error('Get all brands error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب البراندات'
    });
  }
};

// Get brand by ID
export const getBrandById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [brands] = await pool.execute(
      'SELECT * FROM brands WHERE id = ?',
      [id]
    );
    
    if (brands.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'البراند غير موجود'
      });
    }
    
    res.json({
      success: true,
      data: {
        brand: {
          ...brands[0],
          is_active: Boolean(brands[0].is_active)
        }
      }
    });
  } catch (error) {
    console.error('Get brand by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب بيانات البراند'
    });
  }
};

// Create brand (Admin only)
export const createBrand = async (req, res) => {
  try {
    const { name, name_en, logo_url, website_url, display_order = 0, is_active = true } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'اسم البراند مطلوب'
      });
    }
    
    const [result] = await pool.execute(
      'INSERT INTO brands (name, name_en, logo_url, website_url, display_order, is_active) VALUES (?, ?, ?, ?, ?, ?)',
      [name, name_en || name, logo_url || null, website_url || null, display_order, is_active]
    );
    
    const [brands] = await pool.execute(
      'SELECT * FROM brands WHERE id = ?',
      [result.insertId]
    );
    
    res.status(201).json({
      success: true,
      message: 'تم إنشاء البراند بنجاح',
      data: {
        brand: {
          ...brands[0],
          is_active: Boolean(brands[0].is_active)
        }
      }
    });
  } catch (error) {
    console.error('Create brand error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء إنشاء البراند'
    });
  }
};

// Update brand (Admin only)
export const updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, name_en, logo_url, website_url, display_order, is_active } = req.body;
    
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
    
    if (logo_url !== undefined) {
      updates.push('logo_url = ?');
      values.push(logo_url);
    }
    
    if (website_url !== undefined) {
      updates.push('website_url = ?');
      values.push(website_url);
    }
    
    if (display_order !== undefined) {
      updates.push('display_order = ?');
      values.push(display_order);
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
      `UPDATE brands SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
    
    const [brands] = await pool.execute(
      'SELECT * FROM brands WHERE id = ?',
      [id]
    );
    
    res.json({
      success: true,
      message: 'تم تحديث البراند بنجاح',
      data: {
        brand: {
          ...brands[0],
          is_active: Boolean(brands[0].is_active)
        }
      }
    });
  } catch (error) {
    console.error('Update brand error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تحديث البراند'
    });
  }
};

// Delete brand (Admin only)
export const deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.execute('DELETE FROM brands WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'تم حذف البراند بنجاح'
    });
  } catch (error) {
    console.error('Delete brand error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء حذف البراند'
    });
  }
};

// Toggle brand status (Admin only)
export const toggleBrandStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [brands] = await pool.execute(
      'SELECT is_active FROM brands WHERE id = ?',
      [id]
    );
    
    if (brands.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'البراند غير موجود'
      });
    }
    
    const newStatus = !brands[0].is_active;
    
    await pool.execute(
      'UPDATE brands SET is_active = ? WHERE id = ?',
      [newStatus, id]
    );
    
    res.json({
      success: true,
      message: newStatus ? 'تم تفعيل البراند بنجاح' : 'تم تعطيل البراند بنجاح',
      data: {
        is_active: newStatus
      }
    });
  } catch (error) {
    console.error('Toggle brand status error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تغيير حالة البراند'
    });
  }
};
