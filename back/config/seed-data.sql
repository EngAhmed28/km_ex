-- Seed Data للأقسام والمنتجات
-- قم بتشغيل هذا الملف بعد إنشاء الجداول

USE king_of_muscles;

-- حذف البيانات القديمة إذا كانت موجودة (اختياري)
-- DELETE FROM products;
-- DELETE FROM categories;
-- ALTER TABLE products AUTO_INCREMENT = 1;
-- ALTER TABLE categories AUTO_INCREMENT = 1;

-- إدراج الأقسام (مع تجنب التكرار)
INSERT IGNORE INTO categories (name, name_en, description, image_url, slug, is_active) VALUES
('مكملات بروتين', 'Protein Supplements', 'أفضل أنواع البروتين لبناء العضلات', '/uploads/categories/protein.jpg', 'protein-supplements', TRUE),
('مكملات الكرياتين', 'Creatine Supplements', 'كرياتين عالي الجودة لزيادة القوة', '/uploads/categories/creatine.jpg', 'creatine-supplements', TRUE),
('مكملات زيادة الوزن', 'Mass Gainers', 'مكملات لزيادة الوزن والكتلة العضلية', '/uploads/categories/mass-gainer.jpg', 'mass-gainers', TRUE),
('مكملات قبل التمرين', 'Pre-Workout', 'مكملات لزيادة الطاقة والأداء', '/uploads/categories/pre-workout.jpg', 'pre-workout', TRUE),
('فيتامينات ومكملات غذائية', 'Vitamins & Supplements', 'فيتامينات ومكملات غذائية أساسية', '/uploads/categories/vitamins.jpg', 'vitamins-supplements', TRUE);

-- الحصول على IDs الأقسام (سنستخدم متغيرات)
SET @cat_protein = (SELECT id FROM categories WHERE slug = 'protein-supplements' LIMIT 1);
SET @cat_creatine = (SELECT id FROM categories WHERE slug = 'creatine-supplements' LIMIT 1);
SET @cat_mass = (SELECT id FROM categories WHERE slug = 'mass-gainers' LIMIT 1);
SET @cat_preworkout = (SELECT id FROM categories WHERE slug = 'pre-workout' LIMIT 1);
SET @cat_vitamins = (SELECT id FROM categories WHERE slug = 'vitamins-supplements' LIMIT 1);

-- إدراج المنتجات
INSERT INTO products (
  name_ar, name_en, name, description_ar, description_en, description,
  price, old_price, image_url, category_id, stock, rating, reviews_count,
  weight, flavors, nutrition, slug, is_active,
  country_of_origin, expiry_date, manufacture_date, ingredients,
  usage_instructions_ar, usage_instructions_en,
  safety_warnings_ar, safety_warnings_en
) VALUES
-- منتجات بروتين
(
  'واي بروتين آيزوليت - 2.27 كجم',
  'Whey Protein Isolate - 2.27kg',
  'Whey Protein Isolate - 2.27kg',
  'أنقى أنواع البروتين لبناء العضلات والتعافي السريع. يحتوي على 25 جرام بروتين لكل وجبة.',
  'Purest form of protein for muscle building and fast recovery. Contains 25g protein per serving.',
  'Purest form of protein for muscle building and fast recovery.',
  350.00,
  420.00,
  '/uploads/products/whey-isolate.jpg',
  @cat_protein,
  15,
  4.8,
  124,
  '2.27kg',
  JSON_ARRAY('Chocolate', 'Vanilla', 'Strawberry'),
  JSON_ARRAY(
    JSON_OBJECT('labelAr', 'البروتين', 'labelEn', 'Protein', 'value', '25g'),
    JSON_OBJECT('labelAr', 'الكربوهيدرات', 'labelEn', 'Carbs', 'value', '2g'),
    JSON_OBJECT('labelAr', 'الدهون', 'labelEn', 'Fat', 'value', '1g'),
    JSON_OBJECT('labelAr', 'السعرات', 'labelEn', 'Calories', 'value', '120')
  ),
  'whey-protein-isolate-227kg',
  TRUE,
  'United States',
  '2025-12-31',
  '2024-01-15',
  JSON_ARRAY('Whey Protein Isolate', 'Cocoa Powder', 'Natural Flavors', 'Stevia'),
  'اخلط ملعقة واحدة (30 جرام) مع 250-300 مل من الماء أو الحليب. تناول بعد التمرين مباشرة أو في أي وقت من اليوم.',
  'Mix one scoop (30g) with 250-300ml of water or milk. Take immediately after workout or anytime during the day.',
  'يُرجى استشارة الطبيب قبل الاستخدام إذا كنت تعاني من أي حالة صحية. احفظ في مكان بارد وجاف بعيداً عن متناول الأطفال.',
  'Please consult your doctor before use if you have any health conditions. Store in a cool, dry place away from children.'
),
(
  'كازين بروتين - امتصاص بطيء',
  'Casein Protein - Slow Absorption',
  'Casein Protein - Slow Absorption',
  'مثالي للاستخدام قبل النوم لتغذية العضلات طوال الليل. بروتين بطيء الامتصاص.',
  'Perfect for pre-bedtime use to feed muscles throughout the night. Slow-absorbing protein.',
  'Perfect for pre-bedtime use to feed muscles throughout the night.',
  280.00,
  NULL,
  '/uploads/products/casein.jpg',
  @cat_protein,
  25,
  4.7,
  56,
  '1.8kg',
  JSON_ARRAY('Chocolate Silk', 'Creamy Vanilla'),
  JSON_ARRAY(
    JSON_OBJECT('labelAr', 'بروتين بطيء', 'labelEn', 'Slow Protein', 'value', '24g'),
    JSON_OBJECT('labelAr', 'جلوتامين', 'labelEn', 'Glutamine', 'value', '5g')
  ),
  'casein-protein-slow-absorption',
  TRUE,
  'United States',
  '2025-11-30',
  '2024-02-01',
  JSON_ARRAY('Micellar Casein', 'Natural Flavors', 'Stevia'),
  'اخلط ملعقتين (60 جرام) مع 400 مل من الماء أو الحليب قبل النوم بساعة.',
  'Mix two scoops (60g) with 400ml of water or milk one hour before bedtime.',
  'يُرجى استشارة الطبيب قبل الاستخدام. غير مناسب للأشخاص الذين يعانون من حساسية اللاكتوز.',
  'Please consult your doctor before use. Not suitable for people with lactose intolerance.'
),
-- منتجات كرياتين
(
  'كرياتين مونوهيدرات نقي',
  'Pure Creatine Monohydrate',
  'Pure Creatine Monohydrate',
  'كرياتين مونوهيدرات نقي 100% لزيادة القوة البدنية وتحسين الأداء الرياضي.',
  '100% pure creatine monohydrate to increase physical strength and improve athletic performance.',
  '100% pure creatine monohydrate.',
  120.00,
  NULL,
  '/uploads/products/creatine.jpg',
  @cat_creatine,
  50,
  4.9,
  89,
  '300g',
  JSON_ARRAY('Unflavored'),
  JSON_ARRAY(
    JSON_OBJECT('labelAr', 'كرياتين', 'labelEn', 'Creatine', 'value', '5g')
  ),
  'creatine-monohydrate-pure',
  TRUE,
  'Germany',
  '2026-06-30',
  '2024-01-10',
  JSON_ARRAY('Creatine Monohydrate'),
  'خلال أسبوع التحميل: خذ 20 جرام يومياً (4 جرعات × 5 جرام) لمدة 5-7 أيام. بعد ذلك: خذ 5 جرام يومياً.',
  'Loading phase: Take 20g daily (4 servings × 5g) for 5-7 days. Maintenance: Take 5g daily.',
  'اشرب كمية كافية من الماء عند الاستخدام. يُرجى استشارة الطبيب قبل الاستخدام.',
  'Drink plenty of water when using. Please consult your doctor before use.'
),
(
  'كرياتين اوريجينال لاب ٣٠٠ جرام ٦٠',
  'Original Lab Creatine 300g 60',
  'Original Lab Creatine 300g 60',
  'كرياتين عالي الجودة من Original Lab. مثالي لزيادة القوة والأداء.',
  'High-quality creatine from Original Lab. Perfect for increasing strength and performance.',
  'High-quality creatine from Original Lab.',
  650.00,
  1000.00,
  '/uploads/products/creatine-original.jpg',
  @cat_creatine,
  5,
  4.5,
  32,
  '300g',
  JSON_ARRAY('Unflavored'),
  JSON_ARRAY(
    JSON_OBJECT('labelAr', 'كرياتين', 'labelEn', 'Creatine', 'value', '5g')
  ),
  'creatine-original-lab-300g',
  TRUE,
  'United States',
  '2025-12-31',
  '2024-01-05',
  JSON_ARRAY('Creatine Monohydrate', 'Silicon Dioxide'),
  'خذ 5 جرام (ملعقة صغيرة) مع 250 مل من الماء أو العصير بعد التمرين.',
  'Take 5g (one teaspoon) with 250ml of water or juice after workout.',
  'اشرب كمية كافية من الماء. يُرجى استشارة الطبيب قبل الاستخدام.',
  'Drink plenty of water. Please consult your doctor before use.'
),
-- منتجات زيادة الوزن
(
  'سيرياس ماس - زيادة ضخمة',
  'Serious Mass - High Calorie',
  'Serious Mass - High Calorie',
  'أفضل حل لزيادة الوزن والكتلة العضلية للأشخاص النحفاء. يحتوي على 1250 سعرة حرارية.',
  'The best solution for weight and muscle mass gain for thin individuals. Contains 1250 calories.',
  'The best solution for weight and muscle mass gain.',
  320.00,
  380.00,
  '/uploads/products/serious-mass.jpg',
  @cat_mass,
  12,
  4.6,
  210,
  '5.4kg',
  JSON_ARRAY('Chocolate', 'Banana'),
  JSON_ARRAY(
    JSON_OBJECT('labelAr', 'سعرات', 'labelEn', 'Calories', 'value', '1250'),
    JSON_OBJECT('labelAr', 'بروتين', 'labelEn', 'Protein', 'value', '50g'),
    JSON_OBJECT('labelAr', 'كربوهيدرات', 'labelEn', 'Carbs', 'value', '250g')
  ),
  'serious-mass-high-calorie',
  TRUE,
  'United States',
  '2025-10-31',
  '2024-01-20',
  JSON_ARRAY('Maltodextrin', 'Whey Protein', 'Pea Protein', 'Natural Flavors'),
  'اخلط ملعقتين (165 جرام) مع 700 مل من الحليب كامل الدسم. تناول مرتين يومياً بين الوجبات.',
  'Mix two scoops (165g) with 700ml of whole milk. Take twice daily between meals.',
  'يُرجى استشارة الطبيب قبل الاستخدام. غير مناسب للأشخاص الذين يعانون من حساسية اللاكتوز.',
  'Please consult your doctor before use. Not suitable for people with lactose intolerance.'
),
-- منتجات قبل التمرين
(
  'بري ووركاوت انرجي',
  'Pre-Workout Energy',
  'Pre-Workout Energy',
  'مكمل قبل التمرين لزيادة الطاقة والتركيز والأداء الرياضي.',
  'Pre-workout supplement to increase energy, focus, and athletic performance.',
  'Pre-workout supplement to increase energy and performance.',
  250.00,
  300.00,
  '/uploads/products/pre-workout.jpg',
  @cat_preworkout,
  20,
  4.4,
  78,
  '400g',
  JSON_ARRAY('Fruit Punch', 'Blue Raspberry', 'Watermelon'),
  JSON_ARRAY(
    JSON_OBJECT('labelAr', 'كافيين', 'labelEn', 'Caffeine', 'value', '200mg'),
    JSON_OBJECT('labelAr', 'بيتا ألانين', 'labelEn', 'Beta Alanine', 'value', '3g'),
    JSON_OBJECT('labelAr', 'كرياتين', 'labelEn', 'Creatine', 'value', '2g')
  ),
  'pre-workout-energy',
  TRUE,
  'United States',
  '2025-09-30',
  '2024-02-01',
  JSON_ARRAY('Caffeine Anhydrous', 'Beta Alanine', 'Creatine Monohydrate', 'Citrulline Malate'),
  'اخلط ملعقة واحدة (15 جرام) مع 300 مل من الماء. تناول 30 دقيقة قبل التمرين.',
  'Mix one scoop (15g) with 300ml of water. Take 30 minutes before workout.',
  'لا تتجاوز الجرعة الموصى بها. غير مناسب للأشخاص الحساسين للكافيين. لا تستخدم قبل النوم.',
  'Do not exceed recommended dosage. Not suitable for caffeine-sensitive individuals. Do not use before bedtime.'
),
-- منتجات فيتامينات
(
  'فيتامين د3 + ك2',
  'Vitamin D3 + K2',
  'Vitamin D3 + K2',
  'مكمل فيتامين د3 وك2 لصحة العظام والمناعة.',
  'Vitamin D3 and K2 supplement for bone health and immunity.',
  'Vitamin D3 and K2 supplement.',
  180.00,
  NULL,
  '/uploads/products/vitamin-d3-k2.jpg',
  @cat_vitamins,
  30,
  4.7,
  145,
  '60 capsules',
  JSON_ARRAY('Unflavored'),
  JSON_ARRAY(
    JSON_OBJECT('labelAr', 'فيتامين د3', 'labelEn', 'Vitamin D3', 'value', '5000 IU'),
    JSON_OBJECT('labelAr', 'فيتامين ك2', 'labelEn', 'Vitamin K2', 'value', '100mcg')
  ),
  'vitamin-d3-k2',
  TRUE,
  'United States',
  '2026-12-31',
  '2024-01-15',
  JSON_ARRAY('Vitamin D3', 'Vitamin K2', 'MCT Oil', 'Gelatin Capsule'),
  'خذ كبسولة واحدة يومياً مع وجبة تحتوي على دهون.',
  'Take one capsule daily with a meal containing fats.',
  'يُرجى استشارة الطبيب قبل الاستخدام. لا تتجاوز الجرعة الموصى بها.',
  'Please consult your doctor before use. Do not exceed recommended dosage.'
),
(
  'اوريجينال واي كونسنتريت 1 كيلو',
  'Original Whey Concentrate 1 Kilo',
  'Original Whey Concentrate 1 Kilo',
  'بروتين واي كونسنتريت عالي الجودة من Original Lab. مثالي لبناء العضلات.',
  'High-quality whey concentrate protein from Original Lab. Perfect for muscle building.',
  'High-quality whey concentrate protein.',
  1200.00,
  2000.00,
  '/uploads/products/whey-concentrate.jpg',
  @cat_protein,
  10,
  4.6,
  45,
  '1kg',
  JSON_ARRAY('Chocolate', 'Vanilla', 'Strawberry'),
  JSON_ARRAY(
    JSON_OBJECT('labelAr', 'البروتين', 'labelEn', 'Protein', 'value', '24g'),
    JSON_OBJECT('labelAr', 'الكربوهيدرات', 'labelEn', 'Carbs', 'value', '3g'),
    JSON_OBJECT('labelAr', 'الدهون', 'labelEn', 'Fat', 'value', '2g'),
    JSON_OBJECT('labelAr', 'السعرات', 'labelEn', 'Calories', 'value', '130')
  ),
  'original-whey-concentrate-1kg',
  TRUE,
  'United States',
  '2025-12-31',
  '2024-01-10',
  JSON_ARRAY('Whey Protein Concentrate', 'Cocoa Powder', 'Natural Flavors', 'Stevia'),
  'اخلط ملعقة واحدة (30 جرام) مع 250-300 مل من الماء أو الحليب. تناول بعد التمرين مباشرة.',
  'Mix one scoop (30g) with 250-300ml of water or milk. Take immediately after workout.',
  'يُرجى استشارة الطبيب قبل الاستخدام. احفظ في مكان بارد وجاف.',
  'Please consult your doctor before use. Store in a cool, dry place.'
);

-- عرض البيانات المُدرجة
SELECT 'Categories inserted:' as info, COUNT(*) as count FROM categories;
SELECT 'Products inserted:' as info, COUNT(*) as count FROM products;
