import pool from '../config/database.js';

// Get active deal of the day
export const getActiveDeal = async (req, res) => {
  try {
    const now = new Date();
    
    const [deals] = await pool.execute(
      `SELECT d.*, p.name as product_name, p.name_en as product_name_en, p.price as product_price, p.image_url as product_image
       FROM deals_of_day d
       LEFT JOIN products p ON d.product_id = p.id
       WHERE d.is_active = 1 
       AND d.start_date <= ? 
       AND d.end_date >= ?
       ORDER BY d.created_at DESC
       LIMIT 1`,
      [now, now]
    );
    
    if (deals.length === 0) {
      return res.json({
        success: true,
        data: {
          deal: null
        }
      });
    }
    
    const deal = deals[0];
    
    res.json({
      success: true,
      data: {
        deal: {
          ...deal,
          is_active: Boolean(deal.is_active)
        }
      }
    });
  } catch (error) {
    console.error('Get active deal error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب صفقة اليوم'
    });
  }
};

// Get all deals (Admin only)
export const getAllDeals = async (req, res) => {
  try {
    const { is_active } = req.query;
    
    let query = `SELECT d.*, p.name as product_name, p.name_en as product_name_en, p.price as product_price, p.image_url as product_image
                 FROM deals_of_day d
                 LEFT JOIN products p ON d.product_id = p.id
                 WHERE 1=1`;
    const params = [];
    
    if (is_active !== undefined) {
      query += ' AND d.is_active = ?';
      params.push(is_active === 'true' || is_active === '1');
    }
    
    query += ' ORDER BY d.created_at DESC';
    
    const [deals] = await pool.execute(query, params);
    
    res.json({
      success: true,
      data: {
        deals: deals.map(deal => ({
          ...deal,
          is_active: Boolean(deal.is_active)
        }))
      }
    });
  } catch (error) {
    console.error('Get all deals error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب صفقات اليوم'
    });
  }
};

// Get deal by ID
export const getDealById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [deals] = await pool.execute(
      `SELECT d.*, p.name as product_name, p.name_en as product_name_en, p.price as product_price, p.image_url as product_image
       FROM deals_of_day d
       LEFT JOIN products p ON d.product_id = p.id
       WHERE d.id = ?`,
      [id]
    );
    
    if (deals.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'الصفقة غير موجودة'
      });
    }
    
    res.json({
      success: true,
      data: {
        deal: {
          ...deals[0],
          is_active: Boolean(deals[0].is_active)
        }
      }
    });
  } catch (error) {
    console.error('Get deal by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب بيانات الصفقة'
    });
  }
};

// Create deal (Admin only)
export const createDeal = async (req, res) => {
  try {
    const { title_ar, title_en, description_ar, description_en, product_id, discount_percentage, image_url, start_date, end_date, is_active = true } = req.body;
    
    if (!title_ar || !title_en) {
      return res.status(400).json({
        success: false,
        message: 'عنوان الصفقة مطلوب'
      });
    }
    
    if (!start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: 'تاريخ البداية والنهاية مطلوب'
      });
    }
    
    const userId = req.user?.userId;
    
    const [result] = await pool.execute(
      'INSERT INTO deals_of_day (title_ar, title_en, description_ar, description_en, product_id, discount_percentage, image_url, start_date, end_date, is_active, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [title_ar, title_en, description_ar || null, description_en || null, product_id || null, discount_percentage || null, image_url || null, start_date, end_date, is_active, userId || null]
    );
    
    const [deals] = await pool.execute(
      `SELECT d.*, p.name as product_name, p.name_en as product_name_en, p.price as product_price, p.image_url as product_image
       FROM deals_of_day d
       LEFT JOIN products p ON d.product_id = p.id
       WHERE d.id = ?`,
      [result.insertId]
    );
    
    res.status(201).json({
      success: true,
      message: 'تم إنشاء الصفقة بنجاح',
      data: {
        deal: {
          ...deals[0],
          is_active: Boolean(deals[0].is_active)
        }
      }
    });
  } catch (error) {
    console.error('Create deal error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء إنشاء الصفقة'
    });
  }
};

// Update deal (Admin only)
export const updateDeal = async (req, res) => {
  try {
    const { id } = req.params;
    const { title_ar, title_en, description_ar, description_en, product_id, discount_percentage, image_url, start_date, end_date, is_active } = req.body;
    
    const updates = [];
    const values = [];
    
    if (title_ar !== undefined) {
      updates.push('title_ar = ?');
      values.push(title_ar);
    }
    
    if (title_en !== undefined) {
      updates.push('title_en = ?');
      values.push(title_en);
    }
    
    if (description_ar !== undefined) {
      updates.push('description_ar = ?');
      values.push(description_ar);
    }
    
    if (description_en !== undefined) {
      updates.push('description_en = ?');
      values.push(description_en);
    }
    
    if (product_id !== undefined) {
      updates.push('product_id = ?');
      values.push(product_id);
    }
    
    if (discount_percentage !== undefined) {
      updates.push('discount_percentage = ?');
      values.push(discount_percentage);
    }
    
    if (image_url !== undefined) {
      updates.push('image_url = ?');
      values.push(image_url);
    }
    
    if (start_date !== undefined) {
      updates.push('start_date = ?');
      values.push(start_date);
    }
    
    if (end_date !== undefined) {
      updates.push('end_date = ?');
      values.push(end_date);
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
      `UPDATE deals_of_day SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
    
    const [deals] = await pool.execute(
      `SELECT d.*, p.name as product_name, p.name_en as product_name_en, p.price as product_price, p.image_url as product_image
       FROM deals_of_day d
       LEFT JOIN products p ON d.product_id = p.id
       WHERE d.id = ?`,
      [id]
    );
    
    res.json({
      success: true,
      message: 'تم تحديث الصفقة بنجاح',
      data: {
        deal: {
          ...deals[0],
          is_active: Boolean(deals[0].is_active)
        }
      }
    });
  } catch (error) {
    console.error('Update deal error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تحديث الصفقة'
    });
  }
};

// Delete deal (Admin only)
export const deleteDeal = async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.execute('DELETE FROM deals_of_day WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'تم حذف الصفقة بنجاح'
    });
  } catch (error) {
    console.error('Delete deal error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء حذف الصفقة'
    });
  }
};

// Toggle deal status (Admin only)
export const toggleDealStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [deals] = await pool.execute(
      'SELECT is_active FROM deals_of_day WHERE id = ?',
      [id]
    );
    
    if (deals.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'الصفقة غير موجودة'
      });
    }
    
    const newStatus = !deals[0].is_active;
    
    await pool.execute(
      'UPDATE deals_of_day SET is_active = ? WHERE id = ?',
      [newStatus, id]
    );
    
    res.json({
      success: true,
      message: newStatus ? 'تم تفعيل الصفقة بنجاح' : 'تم تعطيل الصفقة بنجاح',
      data: {
        is_active: newStatus
      }
    });
  } catch (error) {
    console.error('Toggle deal status error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تغيير حالة الصفقة'
    });
  }
};
