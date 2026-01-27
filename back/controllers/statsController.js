import pool from '../config/database.js';

// Get all stats
export const getAllStats = async (req, res) => {
  try {
    const { is_active } = req.query;
    
    let query = 'SELECT * FROM site_stats WHERE 1=1';
    const params = [];
    
    if (is_active !== undefined) {
      query += ' AND is_active = ?';
      params.push(is_active === 'true' || is_active === '1');
    } else {
      query += ' AND is_active = 1';
    }
    
    query += ' ORDER BY display_order ASC, created_at DESC';
    
    const [stats] = await pool.execute(query, params);
    
    res.json({
      success: true,
      data: {
        stats: stats.map(stat => ({
          ...stat,
          is_active: Boolean(stat.is_active)
        }))
      }
    });
  } catch (error) {
    console.error('Get all stats error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب الإحصائيات'
    });
  }
};

// Get stat by ID
export const getStatById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [stats] = await pool.execute(
      'SELECT * FROM site_stats WHERE id = ?',
      [id]
    );
    
    if (stats.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'الإحصائية غير موجودة'
      });
    }
    
    res.json({
      success: true,
      data: {
        stat: {
          ...stats[0],
          is_active: Boolean(stats[0].is_active)
        }
      }
    });
  } catch (error) {
    console.error('Get stat by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب بيانات الإحصائية'
    });
  }
};

// Update stat (Admin only)
export const updateStat = async (req, res) => {
  try {
    const { id } = req.params;
    const { stat_value, stat_label_ar, stat_label_en, icon_name, display_order, is_active } = req.body;
    
    const updates = [];
    const values = [];
    
    if (stat_value !== undefined) {
      updates.push('stat_value = ?');
      values.push(stat_value);
    }
    
    if (stat_label_ar !== undefined) {
      updates.push('stat_label_ar = ?');
      values.push(stat_label_ar);
    }
    
    if (stat_label_en !== undefined) {
      updates.push('stat_label_en = ?');
      values.push(stat_label_en);
    }
    
    if (icon_name !== undefined) {
      updates.push('icon_name = ?');
      values.push(icon_name);
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
      `UPDATE site_stats SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
    
    const [stats] = await pool.execute(
      'SELECT * FROM site_stats WHERE id = ?',
      [id]
    );
    
    res.json({
      success: true,
      message: 'تم تحديث الإحصائية بنجاح',
      data: {
        stat: {
          ...stats[0],
          is_active: Boolean(stats[0].is_active)
        }
      }
    });
  } catch (error) {
    console.error('Update stat error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تحديث الإحصائية'
    });
  }
};

// Toggle stat status (Admin only)
export const toggleStatStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [stats] = await pool.execute(
      'SELECT is_active FROM site_stats WHERE id = ?',
      [id]
    );
    
    if (stats.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'الإحصائية غير موجودة'
      });
    }
    
    const newStatus = !stats[0].is_active;
    
    await pool.execute(
      'UPDATE site_stats SET is_active = ? WHERE id = ?',
      [newStatus, id]
    );
    
    res.json({
      success: true,
      message: newStatus ? 'تم تفعيل الإحصائية بنجاح' : 'تم تعطيل الإحصائية بنجاح',
      data: {
        is_active: newStatus
      }
    });
  } catch (error) {
    console.error('Toggle stat status error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تغيير حالة الإحصائية'
    });
  }
};
