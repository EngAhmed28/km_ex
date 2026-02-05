import pool from '../config/database.js';

// Helper function to generate slug
const generateSlug = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

// Get all products
export const getAllProducts = async (req, res) => {
  try {
    const { category, category_id, is_active, show_all, search, min_price, max_price, goal_id } = req.query;
    
    let query = `
      SELECT 
        p.id,
        p.name_ar,
        p.name_en,
        p.name,
        p.description_ar,
        p.description_en,
        p.description,
        p.price,
        p.old_price,
        p.image_url,
        p.category,
        p.category_id,
        p.stock,
        p.rating,
        p.reviews_count,
        p.sales_count,
        p.weight,
        p.flavors,
        p.nutrition,
        p.slug,
        p.is_active,
        p.created_at,
        p.updated_at,
        c.slug as category_slug,
        c.name as category_name,
        c.name_en as category_name_en
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const params = [];
    
    // Filter by goal_id (if provided, show only products linked to this goal)
    if (goal_id) {
      const goalIdNum = parseInt(goal_id);
      if (!isNaN(goalIdNum)) {
        query += ' AND p.id IN (SELECT product_id FROM goal_products WHERE goal_id = ?)';
        params.push(goalIdNum);
      }
    }
    
    // Filter by active status
    if (show_all !== 'true') {
      query += ' AND p.is_active = ?';
      params.push(is_active === 'false' || is_active === '0' ? 0 : 1);
    }
    
    // Filter by category slug
    if (category) {
      query += ' AND c.slug = ?';
      params.push(category);
    }
    
    // Filter by category_id
    if (category_id) {
      query += ' AND p.category_id = ?';
      params.push(category_id);
    }
    
    // Search by name
    if (search) {
      query += ' AND (p.name_ar LIKE ? OR p.name_en LIKE ? OR p.name LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    // Filter by price range
    if (min_price) {
      query += ' AND p.price >= ?';
      params.push(min_price);
    }
    
    if (max_price) {
      query += ' AND p.price <= ?';
      params.push(max_price);
    }
    
    query += ' ORDER BY p.created_at DESC';
    
    const [products] = await pool.execute(query, params);
    
    // Get images for all products
    const productIds = products.map(p => p.id);
    let productImagesMap = {};
    
    if (productIds.length > 0) {
      const placeholders = productIds.map(() => '?').join(',');
      const [images] = await pool.execute(
        `SELECT * FROM product_images WHERE product_id IN (${placeholders}) ORDER BY is_primary DESC, display_order ASC`,
        productIds
      );
      
      // Group images by product_id
      images.forEach(img => {
        if (!productImagesMap[img.product_id]) {
          productImagesMap[img.product_id] = [];
        }
        productImagesMap[img.product_id].push({
          id: img.id,
          url: img.image_url,
          is_primary: img.is_primary === 1,
          display_order: img.display_order
        });
      });
    }
    
    // Format products for frontend
    const formattedProducts = products.map(product => {
      // Parse JSON fields
      let flavors = [];
      let nutrition = [];
      
      try {
        if (product.flavors) {
          flavors = typeof product.flavors === 'string' 
            ? JSON.parse(product.flavors) 
            : product.flavors;
        }
      } catch (e) {
        console.error('Error parsing flavors:', e);
      }
      
      try {
        if (product.nutrition) {
          nutrition = typeof product.nutrition === 'string' 
            ? JSON.parse(product.nutrition) 
            : product.nutrition;
        }
      } catch (e) {
        console.error('Error parsing nutrition:', e);
      }
      
      // Get images for this product
      const images = productImagesMap[product.id] || [];
      const primaryImage = images.find(img => img.is_primary) || images[0];
      
      // Parse ingredients if exists
      let ingredients = [];
      try {
        if (product.ingredients) {
          ingredients = typeof product.ingredients === 'string' 
            ? JSON.parse(product.ingredients) 
            : product.ingredients;
        }
      } catch (e) {
        console.error('Error parsing ingredients:', e);
      }
      
      return {
        id: product.id.toString(),
        nameAr: product.name_ar || product.name || '',
        nameEn: product.name_en || product.name || '',
        price: parseFloat(product.price) || 0,
        oldPrice: product.old_price ? parseFloat(product.old_price) : undefined,
        image: primaryImage?.url || product.image_url || null, // Use primary image or fallback to image_url
        images: images.map(img => img.url), // All images array
        category: product.category_slug || product.category || '',
        category_slug: product.category_slug || product.category || '',
        category_name: product.category_name || '',
        category_name_en: product.category_name_en || '',
        descriptionAr: product.description_ar || product.description || '',
        descriptionEn: product.description_en || product.description || '',
        rating: parseFloat(product.rating) || 0,
        reviewsCount: parseInt(product.reviews_count) || 0,
        sales_count: parseInt(product.sales_count) || 0,
        weight: product.weight || '',
        // Keep original fields for backward compatibility
        name_ar: product.name_ar || product.name || '',
        name_en: product.name_en || product.name || '',
        name: product.name || '',
        flavor: Array.isArray(flavors) ? flavors : [],
        stock: parseInt(product.stock) || 0,
        nutrition: Array.isArray(nutrition) ? nutrition : [],
        slug: product.slug || `product-${product.id}`,
        is_active: product.is_active !== 0,
        category_id: product.category_id,
        // Additional fields
        country_of_origin: product.country_of_origin || null,
        expiry_date: product.expiry_date || null,
        manufacture_date: product.manufacture_date || null,
        ingredients: Array.isArray(ingredients) ? ingredients : [],
        usage_instructions_ar: product.usage_instructions_ar || product.usage_instructions || null,
        usage_instructions_en: product.usage_instructions_en || product.usage_instructions || null,
        safety_warnings_ar: product.safety_warnings_ar || product.safety_warnings || null,
        safety_warnings_en: product.safety_warnings_en || product.safety_warnings || null,
        created_at: product.created_at,
        updated_at: product.updated_at
      };
    });
    
    res.json({
      success: true,
      data: {
        products: formattedProducts
      }
    });
  } catch (error) {
    console.error('Get all products error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب المنتجات'
    });
  }
};

// Get product by ID
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [products] = await pool.execute(
      `SELECT 
        p.*,
        c.slug as category_slug,
        c.name as category_name,
        c.name_en as category_name_en
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?`,
      [id]
    );
    
    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'المنتج غير موجود'
      });
    }
    
    const product = products[0];
    
    // Get images for this product
    const [images] = await pool.execute(
      'SELECT * FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, display_order ASC',
      [id]
    );
    
    const productImages = images.map(img => ({
      id: img.id,
      url: img.image_url,
      is_primary: img.is_primary === 1,
      display_order: img.display_order
    }));
    
    const primaryImage = productImages.find(img => img.is_primary) || productImages[0];
    
    // Parse JSON fields
    let flavors = [];
    let nutrition = [];
    
    try {
      if (product.flavors) {
        flavors = typeof product.flavors === 'string' 
          ? JSON.parse(product.flavors) 
          : product.flavors;
      }
    } catch (e) {
      console.error('Error parsing flavors:', e);
    }
    
    try {
      if (product.nutrition) {
        nutrition = typeof product.nutrition === 'string' 
          ? JSON.parse(product.nutrition) 
          : product.nutrition;
      }
    } catch (e) {
      console.error('Error parsing nutrition:', e);
    }
    
    // Parse ingredients if exists
    let ingredients = [];
    try {
      if (product.ingredients) {
        ingredients = typeof product.ingredients === 'string' 
          ? JSON.parse(product.ingredients) 
          : product.ingredients;
      }
    } catch (e) {
      console.error('Error parsing ingredients:', e);
    }
    
    const formattedProduct = {
      id: product.id.toString(),
      nameAr: product.name_ar || product.name || '',
      nameEn: product.name_en || product.name || '',
      price: parseFloat(product.price) || 0,
      oldPrice: product.old_price ? parseFloat(product.old_price) : undefined,
      image: primaryImage?.url || product.image_url || null, // Use primary image or fallback
      images: productImages.map(img => img.url), // All images array
      category: product.category_slug || product.category || '',
      descriptionAr: product.description_ar || product.description || '',
      descriptionEn: product.description_en || product.description || '',
      rating: parseFloat(product.rating) || 0,
      reviewsCount: parseInt(product.reviews_count) || 0,
      weight: product.weight || '',
      flavor: Array.isArray(flavors) ? flavors : [],
      stock: parseInt(product.stock) || 0,
      nutrition: Array.isArray(nutrition) ? nutrition : [],
      slug: product.slug || `product-${product.id}`,
      is_active: product.is_active !== 0,
      category_id: product.category_id,
      // Additional fields
      country_of_origin: product.country_of_origin || null,
      expiry_date: product.expiry_date || null,
      manufacture_date: product.manufacture_date || null,
      ingredients: Array.isArray(ingredients) ? ingredients : [],
      usage_instructions_ar: product.usage_instructions_ar || product.usage_instructions || null,
      usage_instructions_en: product.usage_instructions_en || product.usage_instructions || null,
      safety_warnings_ar: product.safety_warnings_ar || product.safety_warnings || null,
      safety_warnings_en: product.safety_warnings_en || product.safety_warnings || null
    };
    
    res.json({
      success: true,
      data: {
        product: formattedProduct
      }
    });
  } catch (error) {
    console.error('Get product by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب بيانات المنتج'
    });
  }
};

// Create product (Admin only)
export const createProduct = async (req, res) => {
  try {
    const {
      name_ar,
      name_en,
      description_ar,
      description_en,
      price,
      old_price,
      image_url,
      category_id,
      stock,
      rating,
      reviews_count,
      weight,
      flavors,
      nutrition,
      is_active = true,
      country_of_origin,
      expiry_date,
      manufacture_date,
      ingredients,
      usage_instructions_ar,
      usage_instructions_en,
      safety_warnings_ar,
      safety_warnings_en
    } = req.body;
    
    if (!name_ar && !name_en) {
      return res.status(400).json({
        success: false,
        message: 'اسم المنتج مطلوب'
      });
    }
    
    if (!price) {
      return res.status(400).json({
        success: false,
        message: 'سعر المنتج مطلوب'
      });
    }
    
    // Generate slug
    const slug = generateSlug(name_en || name_ar);
    
    // Prepare JSON fields
    const flavorsJson = flavors ? JSON.stringify(Array.isArray(flavors) ? flavors : [flavors]) : null;
    const nutritionJson = nutrition ? JSON.stringify(Array.isArray(nutrition) ? nutrition : [nutrition]) : null;
    const ingredientsJson = ingredients ? JSON.stringify(Array.isArray(ingredients) ? ingredients : [ingredients]) : null;
    
    const [result] = await pool.execute(
      `INSERT INTO products (
        name_ar, name_en, name, description_ar, description_en, description,
        price, old_price, image_url, category_id, stock, rating, reviews_count,
        weight, flavors, nutrition, slug, is_active,
        country_of_origin, expiry_date, manufacture_date, ingredients,
        usage_instructions_ar, usage_instructions_en,
        safety_warnings_ar, safety_warnings_en
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name_ar || name_en || '',
        name_en || name_ar || '',
        name_ar || name_en || '', // name as fallback
        description_ar || '',
        description_en || '',
        description_ar || description_en || '',
        price,
        old_price || null,
        image_url || null,
        category_id || null,
        stock || 0,
        rating || 0,
        reviews_count || 0,
        weight || null,
        flavorsJson,
        nutritionJson,
        slug,
        is_active ? 1 : 0,
        country_of_origin || null,
        expiry_date || null,
        manufacture_date || null,
        ingredientsJson,
        usage_instructions_ar || null,
        usage_instructions_en || null,
        safety_warnings_ar || null,
        safety_warnings_en || null
      ]
    );
    
    const productId = result.insertId;
    
    // Fetch the created product
    const [products] = await pool.execute(
      `SELECT 
        p.*,
        c.slug as category_slug,
        c.name as category_name,
        c.name_en as category_name_en
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?`,
      [productId]
    );
    
    const product = products[0];
    
    // Parse JSON fields
    let flavorsParsed = [];
    let nutritionParsed = [];
    
    try {
      if (product.flavors) {
        flavorsParsed = typeof product.flavors === 'string' 
          ? JSON.parse(product.flavors) 
          : product.flavors;
      }
    } catch (e) {}
    
    try {
      if (product.nutrition) {
        nutritionParsed = typeof product.nutrition === 'string' 
          ? JSON.parse(product.nutrition) 
          : product.nutrition;
      }
    } catch (e) {}
    
    res.status(201).json({
      success: true,
      message: 'تم إنشاء المنتج بنجاح',
      data: {
        product: {
          id: product.id.toString(),
          nameAr: product.name_ar || product.name || '',
          nameEn: product.name_en || product.name || '',
          price: parseFloat(product.price) || 0,
          oldPrice: product.old_price ? parseFloat(product.old_price) : undefined,
          image: product.image_url || null,
          category: product.category_slug || product.category || '',
          descriptionAr: product.description_ar || product.description || '',
          descriptionEn: product.description_en || product.description || '',
          rating: parseFloat(product.rating) || 0,
          reviewsCount: parseInt(product.reviews_count) || 0,
          weight: product.weight || '',
          flavor: Array.isArray(flavorsParsed) ? flavorsParsed : [],
          stock: parseInt(product.stock) || 0,
          nutrition: Array.isArray(nutritionParsed) ? nutritionParsed : [],
          slug: product.slug || `product-${product.id}`,
          is_active: product.is_active !== 0
        }
      }
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء إنشاء المنتج',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update product (Admin only)
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name_ar,
      name_en,
      description_ar,
      description_en,
      price,
      old_price,
      image_url,
      category_id,
      stock,
      rating,
      reviews_count,
      weight,
      flavors,
      nutrition,
      is_active,
      country_of_origin,
      expiry_date,
      manufacture_date,
      ingredients,
      usage_instructions_ar,
      usage_instructions_en,
      safety_warnings_ar,
      safety_warnings_en
    } = req.body;
    
    // Check if product exists
    const [existingProducts] = await pool.execute(
      'SELECT id FROM products WHERE id = ?',
      [id]
    );
    
    if (existingProducts.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'المنتج غير موجود'
      });
    }
    
    // Build update query dynamically
    const updates = [];
    const params = [];
    
    if (name_ar !== undefined) {
      updates.push('name_ar = ?');
      params.push(name_ar);
    }
    
    if (name_en !== undefined) {
      updates.push('name_en = ?');
      params.push(name_en);
    }
    
    if (name_ar !== undefined || name_en !== undefined) {
      updates.push('name = ?');
      params.push(name_ar || name_en || '');
    }
    
    if (description_ar !== undefined) {
      updates.push('description_ar = ?');
      params.push(description_ar);
    }
    
    if (description_en !== undefined) {
      updates.push('description_en = ?');
      params.push(description_en);
    }
    
    if (description_ar !== undefined || description_en !== undefined) {
      updates.push('description = ?');
      params.push(description_ar || description_en || '');
    }
    
    if (price !== undefined) {
      updates.push('price = ?');
      params.push(price);
    }
    
    if (old_price !== undefined) {
      updates.push('old_price = ?');
      params.push(old_price || null);
    }
    
    if (image_url !== undefined) {
      updates.push('image_url = ?');
      params.push(image_url || null);
    }
    
    if (category_id !== undefined) {
      updates.push('category_id = ?');
      params.push(category_id || null);
    }
    
    if (stock !== undefined) {
      updates.push('stock = ?');
      params.push(stock);
    }
    
    if (rating !== undefined) {
      updates.push('rating = ?');
      params.push(rating);
    }
    
    if (reviews_count !== undefined) {
      updates.push('reviews_count = ?');
      params.push(reviews_count);
    }
    
    if (weight !== undefined) {
      updates.push('weight = ?');
      params.push(weight || null);
    }
    
    if (flavors !== undefined) {
      const flavorsJson = flavors ? JSON.stringify(Array.isArray(flavors) ? flavors : [flavors]) : null;
      updates.push('flavors = ?');
      params.push(flavorsJson);
    }
    
    if (nutrition !== undefined) {
      const nutritionJson = nutrition ? JSON.stringify(Array.isArray(nutrition) ? nutrition : [nutrition]) : null;
      updates.push('nutrition = ?');
      params.push(nutritionJson);
    }
    
    if (is_active !== undefined) {
      updates.push('is_active = ?');
      params.push(is_active ? 1 : 0);
    }
    
    // Additional fields
    if (country_of_origin !== undefined) {
      updates.push('country_of_origin = ?');
      params.push(country_of_origin || null);
    }
    
    if (expiry_date !== undefined) {
      updates.push('expiry_date = ?');
      params.push(expiry_date || null);
    }
    
    if (manufacture_date !== undefined) {
      updates.push('manufacture_date = ?');
      params.push(manufacture_date || null);
    }
    
    if (ingredients !== undefined) {
      const ingredientsJson = ingredients ? JSON.stringify(Array.isArray(ingredients) ? ingredients : [ingredients]) : null;
      updates.push('ingredients = ?');
      params.push(ingredientsJson);
    }
    
    if (usage_instructions_ar !== undefined) {
      updates.push('usage_instructions_ar = ?');
      params.push(usage_instructions_ar || null);
    }
    
    if (usage_instructions_en !== undefined) {
      updates.push('usage_instructions_en = ?');
      params.push(usage_instructions_en || null);
    }
    
    if (safety_warnings_ar !== undefined) {
      updates.push('safety_warnings_ar = ?');
      params.push(safety_warnings_ar || null);
    }
    
    if (safety_warnings_en !== undefined) {
      updates.push('safety_warnings_en = ?');
      params.push(safety_warnings_en || null);
    }
    
    // Update slug if name changed
    if (name_ar !== undefined || name_en !== undefined) {
      const slug = generateSlug(name_en || name_ar);
      updates.push('slug = ?');
      params.push(slug);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'لا توجد بيانات للتحديث'
      });
    }
    
    params.push(id);
    
    await pool.execute(
      `UPDATE products SET ${updates.join(', ')} WHERE id = ?`,
      params
    );
    
    // Fetch updated product
    const [products] = await pool.execute(
      `SELECT 
        p.*,
        c.slug as category_slug,
        c.name as category_name,
        c.name_en as category_name_en
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?`,
      [id]
    );
    
    const product = products[0];
    
    // Parse JSON fields
    let flavorsParsed = [];
    let nutritionParsed = [];
    
    try {
      if (product.flavors) {
        flavorsParsed = typeof product.flavors === 'string' 
          ? JSON.parse(product.flavors) 
          : product.flavors;
      }
    } catch (e) {}
    
    try {
      if (product.nutrition) {
        nutritionParsed = typeof product.nutrition === 'string' 
          ? JSON.parse(product.nutrition) 
          : product.nutrition;
      }
    } catch (e) {}
    
    res.json({
      success: true,
      message: 'تم تحديث المنتج بنجاح',
      data: {
        product: {
          id: product.id.toString(),
          nameAr: product.name_ar || product.name || '',
          nameEn: product.name_en || product.name || '',
          price: parseFloat(product.price) || 0,
          oldPrice: product.old_price ? parseFloat(product.old_price) : undefined,
          image: product.image_url || null,
          category: product.category_slug || product.category || '',
          descriptionAr: product.description_ar || product.description || '',
          descriptionEn: product.description_en || product.description || '',
          rating: parseFloat(product.rating) || 0,
          reviewsCount: parseInt(product.reviews_count) || 0,
          weight: product.weight || '',
          flavor: Array.isArray(flavorsParsed) ? flavorsParsed : [],
          stock: parseInt(product.stock) || 0,
          nutrition: Array.isArray(nutritionParsed) ? nutritionParsed : [],
          slug: product.slug || `product-${product.id}`,
          is_active: product.is_active !== 0
        }
      }
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تحديث المنتج',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Delete product (Admin only)
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [products] = await pool.execute(
      'SELECT id FROM products WHERE id = ?',
      [id]
    );
    
    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'المنتج غير موجود'
      });
    }
    
    await pool.execute('DELETE FROM products WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'تم حذف المنتج بنجاح'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء حذف المنتج'
    });
  }
};

// Toggle product status (Admin only)
export const toggleProductStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [products] = await pool.execute(
      'SELECT id, is_active FROM products WHERE id = ?',
      [id]
    );
    
    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'المنتج غير موجود'
      });
    }
    
    const newStatus = products[0].is_active === 1 ? 0 : 1;
    
    await pool.execute(
      'UPDATE products SET is_active = ? WHERE id = ?',
      [newStatus, id]
    );
    
    res.json({
      success: true,
      message: newStatus === 1 ? 'تم تفعيل المنتج بنجاح' : 'تم تعطيل المنتج بنجاح',
      data: {
        is_active: newStatus === 1
      }
    });
  } catch (error) {
    console.error('Toggle product status error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تغيير حالة المنتج'
    });
  }
};
