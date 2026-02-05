import pool from '../config/database.js';

// Get all goals
export const getAllGoals = async (req, res) => {
  try {
    const { is_active } = req.query;
    // Check if request is authenticated (has user from auth middleware or authorization header)
    const isAuthenticated = !!req.user || !!req.headers.authorization;
    
    let query = 'SELECT * FROM goals WHERE 1=1';
    const params = [];
    
    if (is_active !== undefined) {
      query += ' AND is_active = ?';
      params.push(is_active === 'true' || is_active === '1');
    } else if (!isAuthenticated) {
      // For public routes (not authenticated), show only active goals
      query += ' AND is_active = 1';
    }
    // For authenticated routes (admin), show all goals when is_active is not specified
    
    query += ' ORDER BY display_order ASC, created_at DESC';
    
    const [goals] = await pool.execute(query, params);
    
    res.json({
      success: true,
      data: {
        goals: goals.map(goal => ({
          ...goal,
          is_active: Boolean(goal.is_active)
        }))
      }
    });
  } catch (error) {
    console.error('Get all goals error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب الأهداف'
    });
  }
};

// Get goal by ID
export const getGoalById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [goals] = await pool.execute(
      'SELECT * FROM goals WHERE id = ?',
      [id]
    );
    
    if (goals.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'الهدف غير موجود'
      });
    }
    
    res.json({
      success: true,
      data: {
        goal: {
          ...goals[0],
          is_active: Boolean(goals[0].is_active)
        }
      }
    });
  } catch (error) {
    console.error('Get goal by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب بيانات الهدف'
    });
  }
};

// Create goal (Admin only)
export const createGoal = async (req, res) => {
  try {
    const { title_ar, title_en, icon_name, color_gradient, display_order = 0, is_active = true } = req.body;
    
    if (!title_ar || !title_en || !icon_name || !color_gradient) {
      return res.status(400).json({
        success: false,
        message: 'جميع الحقول مطلوبة'
      });
    }
    
    const [result] = await pool.execute(
      'INSERT INTO goals (title_ar, title_en, icon_name, color_gradient, display_order, is_active) VALUES (?, ?, ?, ?, ?, ?)',
      [title_ar, title_en, icon_name, color_gradient, display_order, is_active]
    );
    
    const [goals] = await pool.execute(
      'SELECT * FROM goals WHERE id = ?',
      [result.insertId]
    );
    
    res.status(201).json({
      success: true,
      message: 'تم إنشاء الهدف بنجاح',
      data: {
        goal: {
          ...goals[0],
          is_active: Boolean(goals[0].is_active)
        }
      }
    });
  } catch (error) {
    console.error('Create goal error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء إنشاء الهدف'
    });
  }
};

// Update goal (Admin only)
export const updateGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const { title_ar, title_en, icon_name, color_gradient, display_order, is_active } = req.body;
    
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
    
    if (icon_name !== undefined) {
      updates.push('icon_name = ?');
      values.push(icon_name);
    }
    
    if (color_gradient !== undefined) {
      updates.push('color_gradient = ?');
      values.push(color_gradient);
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
      `UPDATE goals SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
    
    const [goals] = await pool.execute(
      'SELECT * FROM goals WHERE id = ?',
      [id]
    );
    
    res.json({
      success: true,
      message: 'تم تحديث الهدف بنجاح',
      data: {
        goal: {
          ...goals[0],
          is_active: Boolean(goals[0].is_active)
        }
      }
    });
  } catch (error) {
    console.error('Update goal error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تحديث الهدف'
    });
  }
};

// Delete goal (Admin only)
export const deleteGoal = async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.execute('DELETE FROM goals WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'تم حذف الهدف بنجاح'
    });
  } catch (error) {
    console.error('Delete goal error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء حذف الهدف'
    });
  }
};

// Toggle goal status (Admin only)
export const toggleGoalStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [goals] = await pool.execute(
      'SELECT is_active FROM goals WHERE id = ?',
      [id]
    );
    
    if (goals.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'الهدف غير موجود'
      });
    }
    
    const newStatus = !goals[0].is_active;
    
    await pool.execute(
      'UPDATE goals SET is_active = ? WHERE id = ?',
      [newStatus, id]
    );
    
    res.json({
      success: true,
      message: newStatus ? 'تم تفعيل الهدف بنجاح' : 'تم تعطيل الهدف بنجاح',
      data: {
        is_active: newStatus
      }
    });
  } catch (error) {
    console.error('Toggle goal status error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تغيير حالة الهدف'
    });
  }
};

// Get products linked to a goal
export const getGoalProducts = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [products] = await pool.execute(
      `SELECT 
        p.id,
        p.name_ar,
        p.name_en,
        p.name,
        p.price,
        p.image_url,
        p.is_active,
        c.name as category_name,
        c.name_en as category_name_en
      FROM products p
      INNER JOIN goal_products gp ON p.id = gp.product_id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE gp.goal_id = ?
      ORDER BY p.name_ar ASC`,
      [id]
    );
    
    res.json({
      success: true,
      data: {
        products: products.map(product => ({
          ...product,
          is_active: Boolean(product.is_active)
        }))
      }
    });
  } catch (error) {
    console.error('Get goal products error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب المنتجات المرتبطة بالهدف'
    });
  }
};

// Update products linked to a goal (replace all existing links)
export const updateGoalProducts = async (req, res) => {
  try {
    const { id } = req.params;
    const { product_ids } = req.body; // Array of product IDs
    
    if (!Array.isArray(product_ids)) {
      return res.status(400).json({
        success: false,
        message: 'يجب إرسال مصفوفة من معرفات المنتجات'
      });
    }
    
    // Check if goal exists
    const [goals] = await pool.execute(
      'SELECT id FROM goals WHERE id = ?',
      [id]
    );
    
    if (goals.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'الهدف غير موجود'
      });
    }
    
    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Delete all existing links
      await connection.execute(
        'DELETE FROM goal_products WHERE goal_id = ?',
        [id]
      );
      
      // Insert new links
      if (product_ids.length > 0) {
        // Verify products exist
        const placeholders = product_ids.map(() => '?').join(',');
        const [existingProducts] = await connection.execute(
          `SELECT id FROM products WHERE id IN (${placeholders})`,
          product_ids
        );
        
        const existingProductIds = existingProducts.map(p => p.id);
        
        // Insert only existing products
        if (existingProductIds.length > 0) {
          const insertValues = existingProductIds.map(() => '(?, ?)').join(',');
          const insertParams = existingProductIds.flatMap(pid => [id, pid]);
          
          await connection.execute(
            `INSERT INTO goal_products (goal_id, product_id) VALUES ${insertValues}`,
            insertParams
          );
        }
      }
      
      await connection.commit();
      
      res.json({
        success: true,
        message: 'تم تحديث المنتجات المرتبطة بالهدف بنجاح'
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Update goal products error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تحديث المنتجات المرتبطة بالهدف'
    });
  }
};
