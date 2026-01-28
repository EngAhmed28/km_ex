import pool from '../config/database.js';

// Get site settings
export const getSiteSettings = async (req, res) => {
  try {
    const [settings] = await pool.execute(
      'SELECT * FROM site_settings ORDER BY id DESC LIMIT 1'
    );
    
    if (settings.length === 0) {
      // Return default settings if none exist
      return res.json({
        success: true,
        data: {
          settings: {
            site_name_ar: 'King of Muscles',
            site_name_en: 'King of Muscles',
            logo_url: null,
            footer_description_ar: 'King of Muscles هو وجهتك الأولى للحصول على أجود أنواع المكملات الغذائية في العالم العربي.',
            footer_description_en: 'King of Muscles is your first destination to get the best types of nutritional supplements in the Arab world.',
            facebook_url: null,
            instagram_url: null,
            twitter_url: null,
            youtube_url: null,
            address_ar: 'الرياض، المملكة العربية السعودية - شارع التحلية',
            address_en: 'Riyadh, Kingdom of Saudi Arabia - Tahlia Street',
            phone: '+966 50 123 4567',
            email: 'info@kingofmuscles.com',
            shop_links: [],
            support_links: []
          }
        }
      });
    }
    
    const setting = settings[0];
    
    // Parse JSON fields
    let shop_links = [];
    let support_links = [];
    
    try {
      shop_links = setting.shop_links ? JSON.parse(setting.shop_links) : [];
    } catch (e) {
      shop_links = [];
    }
    
    try {
      support_links = setting.support_links ? JSON.parse(setting.support_links) : [];
    } catch (e) {
      support_links = [];
    }
    
    res.json({
      success: true,
      data: {
        settings: {
          id: setting.id,
          site_name_ar: setting.site_name_ar,
          site_name_en: setting.site_name_en,
          logo_url: setting.logo_url,
          footer_description_ar: setting.footer_description_ar,
          footer_description_en: setting.footer_description_en,
          facebook_url: setting.facebook_url,
          instagram_url: setting.instagram_url,
          twitter_url: setting.twitter_url,
          youtube_url: setting.youtube_url,
          address_ar: setting.address_ar,
          address_en: setting.address_en,
          phone: setting.phone,
          email: setting.email,
          shop_links: shop_links,
          support_links: support_links
        }
      }
    });
  } catch (error) {
    console.error('Get site settings error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب إعدادات الموقع'
    });
  }
};

// Update site settings (Admin only)
export const updateSiteSettings = async (req, res) => {
  try {
    const {
      site_name_ar,
      site_name_en,
      logo_url,
      footer_description_ar,
      footer_description_en,
      facebook_url,
      instagram_url,
      twitter_url,
      youtube_url,
      address_ar,
      address_en,
      phone,
      email,
      shop_links,
      support_links
    } = req.body;
    
    // Check if settings exist
    const [existing] = await pool.execute(
      'SELECT id FROM site_settings ORDER BY id DESC LIMIT 1'
    );
    
    let shopLinksJson = null;
    let supportLinksJson = null;
    
    if (shop_links && Array.isArray(shop_links)) {
      shopLinksJson = JSON.stringify(shop_links);
    }
    
    if (support_links && Array.isArray(support_links)) {
      supportLinksJson = JSON.stringify(support_links);
    }
    
    if (existing.length === 0) {
      // Insert new settings
      const [result] = await pool.execute(
        `INSERT INTO site_settings (
          site_name_ar, site_name_en, logo_url,
          footer_description_ar, footer_description_en,
          facebook_url, instagram_url, twitter_url, youtube_url,
          address_ar, address_en, phone, email,
          shop_links, support_links
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          site_name_ar || 'King of Muscles',
          site_name_en || 'King of Muscles',
          logo_url || null,
          footer_description_ar || null,
          footer_description_en || null,
          facebook_url || null,
          instagram_url || null,
          twitter_url || null,
          youtube_url || null,
          address_ar || null,
          address_en || null,
          phone || null,
          email || null,
          shopLinksJson,
          supportLinksJson
        ]
      );
      
      const [newSettings] = await pool.execute(
        'SELECT * FROM site_settings WHERE id = ?',
        [result.insertId]
      );
      
      return res.json({
        success: true,
        message: 'تم حفظ إعدادات الموقع بنجاح',
        data: {
          settings: {
            ...newSettings[0],
            shop_links: shop_links || [],
            support_links: support_links || []
          }
        }
      });
    } else {
      // Update existing settings
      const updates = [];
      const values = [];
      
      if (site_name_ar !== undefined) {
        updates.push('site_name_ar = ?');
        values.push(site_name_ar);
      }
      if (site_name_en !== undefined) {
        updates.push('site_name_en = ?');
        values.push(site_name_en);
      }
      if (logo_url !== undefined) {
        updates.push('logo_url = ?');
        values.push(logo_url);
      }
      if (footer_description_ar !== undefined) {
        updates.push('footer_description_ar = ?');
        values.push(footer_description_ar);
      }
      if (footer_description_en !== undefined) {
        updates.push('footer_description_en = ?');
        values.push(footer_description_en);
      }
      if (facebook_url !== undefined) {
        updates.push('facebook_url = ?');
        values.push(facebook_url);
      }
      if (instagram_url !== undefined) {
        updates.push('instagram_url = ?');
        values.push(instagram_url);
      }
      if (twitter_url !== undefined) {
        updates.push('twitter_url = ?');
        values.push(twitter_url);
      }
      if (youtube_url !== undefined) {
        updates.push('youtube_url = ?');
        values.push(youtube_url);
      }
      if (address_ar !== undefined) {
        updates.push('address_ar = ?');
        values.push(address_ar);
      }
      if (address_en !== undefined) {
        updates.push('address_en = ?');
        values.push(address_en);
      }
      if (phone !== undefined) {
        updates.push('phone = ?');
        values.push(phone);
      }
      if (email !== undefined) {
        updates.push('email = ?');
        values.push(email);
      }
      if (shopLinksJson !== null) {
        updates.push('shop_links = ?');
        values.push(shopLinksJson);
      }
      if (supportLinksJson !== null) {
        updates.push('support_links = ?');
        values.push(supportLinksJson);
      }
      
      if (updates.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'لا توجد بيانات للتحديث'
        });
      }
      
      values.push(existing[0].id);
      
      await pool.execute(
        `UPDATE site_settings SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
      
      const [updatedSettings] = await pool.execute(
        'SELECT * FROM site_settings WHERE id = ?',
        [existing[0].id]
      );
      
      let shopLinks = [];
      let supportLinks = [];
      
      try {
        shopLinks = updatedSettings[0].shop_links ? JSON.parse(updatedSettings[0].shop_links) : [];
      } catch (e) {
        shopLinks = [];
      }
      
      try {
        supportLinks = updatedSettings[0].support_links ? JSON.parse(updatedSettings[0].support_links) : [];
      } catch (e) {
        supportLinks = [];
      }
      
      res.json({
        success: true,
        message: 'تم تحديث إعدادات الموقع بنجاح',
        data: {
          settings: {
            ...updatedSettings[0],
            shop_links: shopLinks,
            support_links: supportLinks
          }
        }
      });
    }
  } catch (error) {
    console.error('Update site settings error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تحديث إعدادات الموقع'
    });
  }
};
