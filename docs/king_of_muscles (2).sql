-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 26, 2026 at 01:20 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `king_of_muscles`
--

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `name_en` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `slug` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `name_en`, `description`, `image_url`, `is_active`, `created_at`, `updated_at`, `slug`) VALUES
(1, 'مكملات بروتين', 'Protein Supplements', 'أفضل أنواع البروتين لبناء العضلات', '/uploads/categories/category-1769417575283-385166577.webp', 1, '2026-01-25 11:50:57', '2026-01-26 08:52:55', 'protein-supplements'),
(2, 'مكملات الكرياتين', 'Creatine Supplements', 'كرياتين عالي الجودة لزيادة القوة', '/uploads/categories/category-1769417584644-341888667.webp', 1, '2026-01-25 11:50:57', '2026-01-26 08:53:04', 'creatine-supplements'),
(3, 'مكملات زيادة الوزن', 'Mass Gainers', 'مكملات لزيادة الوزن والكتلة العضلية', '/uploads/categories/category-1769417635292-467530920.webp', 1, '2026-01-25 11:50:57', '2026-01-26 08:53:55', 'mass-gainers'),
(4, 'مكملات قبل التمرين', 'Pre-Workout', 'مكملات لزيادة الطاقة والأداء', '/uploads/categories/category-1769417643612-81239685.webp', 1, '2026-01-25 11:50:57', '2026-01-26 08:54:03', 'pre-workout'),
(5, 'فيتامينات ومكملات غذائية', 'Vitamins & Supplements', 'فيتامينات ومكملات غذائية أساسية', '/uploads/categories/category-1769417612267-741975133.webp', 1, '2026-01-25 11:50:57', '2026-01-26 08:53:32', 'vitamins-supplements');

-- --------------------------------------------------------

--
-- Table structure for table `customer_discounts`
--

CREATE TABLE `customer_discounts` (
  `id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `discount_percentage` decimal(5,2) NOT NULL COMMENT 'نسبة الخصم من 0 إلى 100',
  `start_date` date NOT NULL COMMENT 'تاريخ بداية الخصم',
  `end_date` date NOT NULL COMMENT 'تاريخ نهاية الخصم',
  `is_active` tinyint(1) DEFAULT 1 COMMENT 'حالة تفعيل الخصم',
  `created_by` int(11) DEFAULT NULL COMMENT 'المدير الذي أنشأ الخصم',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

--
-- Dumping data for table `customer_discounts`
--

INSERT INTO `customer_discounts` (`id`, `customer_id`, `discount_percentage`, `start_date`, `end_date`, `is_active`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 6, 30.00, '2026-01-26', '2026-01-27', 1, 1, '2026-01-26 10:54:11', '2026-01-26 10:54:11');

-- --------------------------------------------------------

--
-- Table structure for table `employee_permissions`
--

CREATE TABLE `employee_permissions` (
  `id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `permission_type` enum('users','categories','products','orders') NOT NULL,
  `can_view` tinyint(1) DEFAULT 0,
  `can_create` tinyint(1) DEFAULT 0,
  `can_edit` tinyint(1) DEFAULT 0,
  `can_delete` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `employee_permissions`
--

INSERT INTO `employee_permissions` (`id`, `employee_id`, `permission_type`, `can_view`, `can_create`, `can_edit`, `can_delete`, `created_at`, `updated_at`) VALUES
(24, 2, 'users', 1, 1, 1, 1, '2026-01-26 10:28:02', '2026-01-26 10:28:02'),
(25, 2, 'categories', 1, 1, 1, 1, '2026-01-26 10:28:02', '2026-01-26 10:28:02'),
(26, 2, 'products', 1, 1, 1, 1, '2026-01-26 10:28:02', '2026-01-26 10:28:02'),
(27, 2, 'orders', 1, 1, 1, 1, '2026-01-26 10:28:02', '2026-01-26 10:28:02');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `status` enum('pending','processing','shipped','delivered','cancelled') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `shipping_address` text DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `guest_name` varchar(255) DEFAULT NULL,
  `guest_email` varchar(255) DEFAULT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `governorate` varchar(100) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `user_id`, `total_amount`, `status`, `created_at`, `updated_at`, `shipping_address`, `phone`, `notes`, `guest_name`, `guest_email`, `payment_method`, `governorate`, `city`) VALUES
(6, 6, 180.00, 'pending', '2026-01-25 13:07:34', '2026-01-25 13:07:34', 'المنوفية, سبيسب', '01007174966', NULL, NULL, NULL, 'cash_on_delivery', 'المنوفية', 'سبيسب'),
(7, 6, 245.00, 'pending', '2026-01-26 11:14:21', '2026-01-26 11:14:21', 'المنوفية , سبيسب', '43534534534', '45656', NULL, NULL, 'instapay', 'المنوفية ', 'سبيسب');

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `price` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `quantity`, `price`, `created_at`) VALUES
(3, 6, 7, 1, 180.00, '2026-01-25 13:07:34'),
(4, 7, 1, 1, 245.00, '2026-01-26 11:14:21');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `name_ar` varchar(255) DEFAULT NULL,
  `name_en` varchar(255) DEFAULT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `description_ar` text DEFAULT NULL,
  `description_en` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `old_price` decimal(10,2) DEFAULT NULL,
  `rating` decimal(3,2) DEFAULT 0.00,
  `reviews_count` int(11) DEFAULT 0,
  `image_url` varchar(500) DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `stock` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `weight` varchar(100) DEFAULT NULL,
  `country_of_origin` varchar(100) DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `manufacture_date` date DEFAULT NULL,
  `flavors` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`flavors`)),
  `nutrition` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`nutrition`)),
  `ingredients` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`ingredients`)),
  `usage_instructions` text DEFAULT NULL,
  `usage_instructions_ar` text DEFAULT NULL,
  `usage_instructions_en` text DEFAULT NULL,
  `safety_warnings` text DEFAULT NULL,
  `safety_warnings_ar` text DEFAULT NULL,
  `safety_warnings_en` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `category_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `name_ar`, `name_en`, `slug`, `description`, `description_ar`, `description_en`, `price`, `old_price`, `rating`, `reviews_count`, `image_url`, `category`, `stock`, `is_active`, `weight`, `country_of_origin`, `expiry_date`, `manufacture_date`, `flavors`, `nutrition`, `ingredients`, `usage_instructions`, `usage_instructions_ar`, `usage_instructions_en`, `safety_warnings`, `safety_warnings_ar`, `safety_warnings_en`, `created_at`, `updated_at`, `category_id`) VALUES
(1, 'واي بروتين آيزوليت - 2.27 كجم', 'واي بروتين آيزوليت - 2.27 كجم', 'Whey Protein Isolate - 2.27kg', 'whey-protein-isolate-227kg', 'أنقى أنواع البروتين لبناء العضلات والتعافي السريع. يحتوي على 25 جرام بروتين لكل وجبة.', 'أنقى أنواع البروتين لبناء العضلات والتعافي السريع. يحتوي على 25 جرام بروتين لكل وجبة.', 'Purest form of protein for muscle building and fast recovery. Contains 25g protein per serving.', 350.00, 420.00, 3.50, 2, NULL, NULL, 13, 1, '2.27kg', 'United States', '2025-12-27', '2024-01-11', '[\"Chocolate\",\"Vanilla\",\"Strawberry\"]', '[{\"labelAr\":\"البروتين\",\"labelEn\":\"Protein\",\"value\":\"25g\"},{\"labelAr\":\"الكربوهيدرات\",\"labelEn\":\"Carbs\",\"value\":\"2g\"},{\"labelAr\":\"الدهون\",\"labelEn\":\"Fat\",\"value\":\"1g\"},{\"labelAr\":\"السعرات\",\"labelEn\":\"Calories\",\"value\":\"120\"}]', '[\"Whey Protein Isolate\",\"Cocoa Powder\",\"Natural Flavors\",\"Stevia\"]', NULL, 'اخلط ملعقة واحدة (30 جرام) مع 250-300 مل من الماء أو الحليب. تناول بعد التمرين مباشرة أو في أي وقت من اليوم.', 'Mix one scoop (30g) with 250-300ml of water or milk. Take immediately after workout or anytime during the day.', NULL, 'يُرجى استشارة الطبيب قبل الاستخدام إذا كنت تعاني من أي حالة صحية. احفظ في مكان بارد وجاف بعيداً عن متناول الأطفال.', 'Please consult your doctor before use if you have any health conditions. Store in a cool, dry place away from children.', '2026-01-25 11:50:57', '2026-01-26 12:20:07', 1),
(2, 'كازين بروتين - امتصاص بطيء', 'كازين بروتين - امتصاص بطيء', 'Casein Protein - Slow Absorption', 'casein-protein-slow-absorption', 'مثالي للاستخدام قبل النوم لتغذية العضلات طوال الليل. بروتين بطيء الامتصاص.', 'مثالي للاستخدام قبل النوم لتغذية العضلات طوال الليل. بروتين بطيء الامتصاص.', 'Perfect for pre-bedtime use to feed muscles throughout the night. Slow-absorbing protein.', 280.00, NULL, 4.70, 56, NULL, NULL, 23, 1, '1.8kg', 'United States', '2025-11-29', '2024-01-31', '[\"Chocolate Silk\",\"Creamy Vanilla\"]', '[{\"labelAr\":\"بروتين بطيء\",\"labelEn\":\"Slow Protein\",\"value\":\"24g\"},{\"labelAr\":\"جلوتامين\",\"labelEn\":\"Glutamine\",\"value\":\"5g\"}]', '[\"Micellar Casein\",\"Natural Flavors\",\"Stevia\"]', NULL, 'اخلط ملعقتين (60 جرام) مع 400 مل من الماء أو الحليب قبل النوم بساعة.', 'Mix two scoops (60g) with 400ml of water or milk one hour before bedtime.', NULL, 'يُرجى استشارة الطبيب قبل الاستخدام. غير مناسب للأشخاص الذين يعانون من حساسية اللاكتوز.', 'Please consult your doctor before use. Not suitable for people with lactose intolerance.', '2026-01-25 11:50:57', '2026-01-26 11:28:13', 1),
(3, 'كرياتين مونوهيدرات نقي', 'كرياتين مونوهيدرات نقي', 'Pure Creatine Monohydrate', 'pure-creatine-monohydrate', 'كرياتين مونوهيدرات نقي 100% لزيادة القوة البدنية وتحسين الأداء الرياضي.', 'كرياتين مونوهيدرات نقي 100% لزيادة القوة البدنية وتحسين الأداء الرياضي.', '100% pure creatine monohydrate to increase physical strength and improve athletic performance.', 120.00, NULL, 4.90, 89, NULL, NULL, 50, 1, '300g', 'Germany', '2026-06-29', '2024-01-09', '[\"Unflavored\"]', '[{\"labelAr\":\"كرياتين\",\"labelEn\":\"Creatine\",\"value\":\"5g\"}]', '[\"Creatine Monohydrate\"]', NULL, 'خلال أسبوع التحميل: خذ 20 جرام يومياً (4 جرعات × 5 جرام) لمدة 5-7 أيام. بعد ذلك: خذ 5 جرام يومياً.', 'Loading phase: Take 20g daily (4 servings × 5g) for 5-7 days. Maintenance: Take 5g daily.', NULL, 'اشرب كمية كافية من الماء عند الاستخدام. يُرجى استشارة الطبيب قبل الاستخدام.', 'Drink plenty of water when using. Please consult your doctor before use.', '2026-01-25 11:50:57', '2026-01-26 11:30:20', 2),
(4, 'كرياتين اوريجينال لاب ٣٠٠ جرام ٦٠', 'كرياتين اوريجينال لاب ٣٠٠ جرام ٦٠', 'Original Lab Creatine 300g 60', 'original-lab-creatine-300g-60', 'كرياتين عالي الجودة من Original Lab. مثالي لزيادة القوة والأداء.', 'كرياتين عالي الجودة من Original Lab. مثالي لزيادة القوة والأداء.', 'High-quality creatine from Original Lab. Perfect for increasing strength and performance.', 650.00, 1000.00, 4.50, 32, NULL, NULL, 5, 1, '300g', 'United States', '2025-12-30', '2024-01-04', '[\"Unflavored\"]', '[{\"labelAr\":\"كرياتين\",\"labelEn\":\"Creatine\",\"value\":\"5g\"}]', '[\"Creatine Monohydrate\",\"Silicon Dioxide\"]', NULL, 'خذ 5 جرام (ملعقة صغيرة) مع 250 مل من الماء أو العصير بعد التمرين.', 'Take 5g (one teaspoon) with 250ml of water or juice after workout.', NULL, 'اشرب كمية كافية من الماء. يُرجى استشارة الطبيب قبل الاستخدام.', 'Drink plenty of water. Please consult your doctor before use.', '2026-01-25 11:50:57', '2026-01-26 11:31:29', 2),
(5, 'سيرياس ماس - زيادة ضخمة', 'سيرياس ماس - زيادة ضخمة', 'Serious Mass - High Calorie', 'serious-mass-high-calorie', 'أفضل حل لزيادة الوزن والكتلة العضلية للأشخاص النحفاء. يحتوي على 1250 سعرة حرارية.', 'أفضل حل لزيادة الوزن والكتلة العضلية للأشخاص النحفاء. يحتوي على 1250 سعرة حرارية.', 'The best solution for weight and muscle mass gain for thin individuals. Contains 1250 calories.', 320.00, 380.00, 4.60, 210, NULL, NULL, 12, 1, '5.4kg', 'United States', '2025-10-30', '2024-01-19', '[\"Chocolate\",\"Banana\"]', '[{\"labelAr\":\"سعرات\",\"labelEn\":\"Calories\",\"value\":\"1250\"},{\"labelAr\":\"بروتين\",\"labelEn\":\"Protein\",\"value\":\"50g\"},{\"labelAr\":\"كربوهيدرات\",\"labelEn\":\"Carbs\",\"value\":\"250g\"}]', '[\"Maltodextrin\",\"Whey Protein\",\"Pea Protein\",\"Natural Flavors\"]', NULL, 'اخلط ملعقتين (165 جرام) مع 700 مل من الحليب كامل الدسم. تناول مرتين يومياً بين الوجبات.', 'Mix two scoops (165g) with 700ml of whole milk. Take twice daily between meals.', NULL, 'يُرجى استشارة الطبيب قبل الاستخدام. غير مناسب للأشخاص الذين يعانون من حساسية اللاكتوز.', 'Please consult your doctor before use. Not suitable for people with lactose intolerance.', '2026-01-25 11:50:57', '2026-01-26 11:32:53', 3),
(6, 'بري ووركاوت انرجي', 'بري ووركاوت انرجي', 'Pre-Workout Energy', 'pre-workout-energy', 'مكمل قبل التمرين لزيادة الطاقة والتركيز والأداء الرياضي.', 'مكمل قبل التمرين لزيادة الطاقة والتركيز والأداء الرياضي.', 'Pre-workout supplement to increase energy, focus, and athletic performance.', 250.00, 300.00, 4.40, 78, NULL, NULL, 18, 1, '400g', 'United States', '2025-09-29', '2024-01-31', '[\"Fruit Punch\",\"Blue Raspberry\",\"Watermelon\"]', '[{\"labelAr\":\"كافيين\",\"labelEn\":\"Caffeine\",\"value\":\"200mg\"},{\"labelAr\":\"بيتا ألانين\",\"labelEn\":\"Beta Alanine\",\"value\":\"3g\"},{\"labelAr\":\"كرياتين\",\"labelEn\":\"Creatine\",\"value\":\"2g\"}]', '[\"Caffeine Anhydrous\",\"Beta Alanine\",\"Creatine Monohydrate\",\"Citrulline Malate\"]', NULL, 'اخلط ملعقة واحدة (15 جرام) مع 300 مل من الماء. تناول 30 دقيقة قبل التمرين.', 'Mix one scoop (15g) with 300ml of water. Take 30 minutes before workout.', NULL, 'لا تتجاوز الجرعة الموصى بها. غير مناسب للأشخاص الحساسين للكافيين. لا تستخدم قبل النوم.', 'Do not exceed recommended dosage. Not suitable for caffeine-sensitive individuals. Do not use before bedtime.', '2026-01-25 11:50:57', '2026-01-26 11:34:07', 4),
(7, 'فيتامين د3 + ك2', 'فيتامين د3 + ك2', 'Vitamin D3 + K2', 'vitamin-d3-k2', 'مكمل فيتامين د3 وك2 لصحة العظام والمناعة.', 'مكمل فيتامين د3 وك2 لصحة العظام والمناعة.', 'Vitamin D3 and K2 supplement for bone health and immunity.', 180.00, NULL, 4.70, 145, NULL, NULL, 29, 1, '60 capsules', 'United States', '2026-12-30', '2024-01-14', '[\"Unflavored\"]', '[{\"labelAr\":\"فيتامين د3\",\"labelEn\":\"Vitamin D3\",\"value\":\"5000 IU\"},{\"labelAr\":\"فيتامين ك2\",\"labelEn\":\"Vitamin K2\",\"value\":\"100mcg\"}]', '[\"Vitamin D3\",\"Vitamin K2\",\"MCT Oil\",\"Gelatin Capsule\"]', NULL, 'خذ كبسولة واحدة يومياً مع وجبة تحتوي على دهون.', 'Take one capsule daily with a meal containing fats.', NULL, 'يُرجى استشارة الطبيب قبل الاستخدام. لا تتجاوز الجرعة الموصى بها.', 'Please consult your doctor before use. Do not exceed recommended dosage.', '2026-01-25 11:50:57', '2026-01-26 11:35:13', 5),
(8, 'اوريجينال واي كونسنتريت 1 كيلو', 'اوريجينال واي كونسنتريت 1 كيلو', 'Original Whey Concentrate 1 Kilo', 'original-whey-concentrate-1-kilo', 'بروتين واي كونسنتريت عالي الجودة من Original Lab. مثالي لبناء العضلات.', 'بروتين واي كونسنتريت عالي الجودة من Original Lab. مثالي لبناء العضلات.', 'High-quality whey concentrate protein from Original Lab. Perfect for muscle building.', 1200.00, 2000.00, 4.60, 45, NULL, NULL, 10, 1, '1kg', 'United States', '2025-12-30', '2024-01-09', '[\"Chocolate\",\"Vanilla\",\"Strawberry\"]', '[{\"labelAr\":\"البروتين\",\"labelEn\":\"Protein\",\"value\":\"24g\"},{\"labelAr\":\"الكربوهيدرات\",\"labelEn\":\"Carbs\",\"value\":\"3g\"},{\"labelAr\":\"الدهون\",\"labelEn\":\"Fat\",\"value\":\"2g\"},{\"labelAr\":\"السعرات\",\"labelEn\":\"Calories\",\"value\":\"130\"}]', '[\"Whey Protein Concentrate\",\"Cocoa Powder\",\"Natural Flavors\",\"Stevia\"]', NULL, 'اخلط ملعقة واحدة (30 جرام) مع 250-300 مل من الماء أو الحليب. تناول بعد التمرين مباشرة.', 'Mix one scoop (30g) with 250-300ml of water or milk. Take immediately after workout.', NULL, 'يُرجى استشارة الطبيب قبل الاستخدام. احفظ في مكان بارد وجاف.', 'Please consult your doctor before use. Store in a cool, dry place.', '2026-01-25 11:50:57', '2026-01-26 11:57:54', 1);

-- --------------------------------------------------------

--
-- Table structure for table `product_images`
--

CREATE TABLE `product_images` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `image_url` varchar(500) NOT NULL,
  `is_primary` tinyint(1) DEFAULT 0,
  `display_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_images`
--

INSERT INTO `product_images` (`id`, `product_id`, `image_url`, `is_primary`, `display_order`, `created_at`, `updated_at`) VALUES
(1, 1, '/uploads/products/product-1769418227144-482009064.webp', 1, 0, '2026-01-26 09:03:47', '2026-01-26 09:03:47'),
(2, 2, '/uploads/products/product-1769426893354-586368455.webp', 1, 0, '2026-01-26 11:28:13', '2026-01-26 11:28:13'),
(3, 2, '/uploads/products/product-1769426893355-590095297.webp', 0, 0, '2026-01-26 11:28:13', '2026-01-26 11:28:13'),
(4, 3, '/uploads/products/product-1769427020571-702706182.webp', 1, 0, '2026-01-26 11:30:20', '2026-01-26 11:30:20'),
(5, 3, '/uploads/products/product-1769427020573-640396062.webp', 0, 0, '2026-01-26 11:30:20', '2026-01-26 11:30:20'),
(6, 4, '/uploads/products/product-1769427089421-26712667.webp', 1, 0, '2026-01-26 11:31:29', '2026-01-26 11:31:29'),
(7, 5, '/uploads/products/product-1769427173900-84494792.webp', 1, 0, '2026-01-26 11:32:53', '2026-01-26 11:32:53'),
(8, 6, '/uploads/products/product-1769427247337-280199567.webp', 1, 0, '2026-01-26 11:34:07', '2026-01-26 11:34:07'),
(9, 7, '/uploads/products/product-1769427313710-497671983.webp', 1, 0, '2026-01-26 11:35:13', '2026-01-26 11:35:13'),
(10, 8, '/uploads/products/product-1769428674626-641696764.webp', 1, 0, '2026-01-26 11:57:54', '2026-01-26 11:57:54');

-- --------------------------------------------------------

--
-- Table structure for table `product_reviews`
--

CREATE TABLE `product_reviews` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `rating` int(11) NOT NULL CHECK (`rating` >= 1 and `rating` <= 5),
  `comment` text DEFAULT NULL,
  `helpful_count` int(11) DEFAULT 0,
  `is_verified_purchase` tinyint(1) DEFAULT 0,
  `is_approved` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_reviews`
--

INSERT INTO `product_reviews` (`id`, `product_id`, `user_id`, `rating`, `comment`, `helpful_count`, `is_verified_purchase`, `is_approved`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 3, 'هذا المنتج رائع حقا', 1, 0, 1, '2026-01-26 12:19:12', '2026-01-26 12:19:45'),
(2, 1, 2, 4, 'من المنتجات الجميلة', 0, 0, 1, '2026-01-26 12:20:07', '2026-01-26 12:20:07');

--
-- Triggers `product_reviews`
--
DELIMITER $$
CREATE TRIGGER `update_product_rating_after_review_delete` AFTER DELETE ON `product_reviews` FOR EACH ROW BEGIN
  UPDATE products
  SET 
    rating = COALESCE((
      SELECT AVG(rating) 
      FROM product_reviews 
      WHERE product_id = OLD.product_id AND is_approved = TRUE
    ), 0.00),
    reviews_count = COALESCE((
      SELECT COUNT(*) 
      FROM product_reviews 
      WHERE product_id = OLD.product_id AND is_approved = TRUE
    ), 0)
  WHERE id = OLD.product_id;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `update_product_rating_after_review_insert` AFTER INSERT ON `product_reviews` FOR EACH ROW BEGIN
  UPDATE products
  SET 
    rating = COALESCE((
      SELECT AVG(rating) 
      FROM product_reviews 
      WHERE product_id = NEW.product_id AND is_approved = TRUE
    ), 0.00),
    reviews_count = COALESCE((
      SELECT COUNT(*) 
      FROM product_reviews 
      WHERE product_id = NEW.product_id AND is_approved = TRUE
    ), 0)
  WHERE id = NEW.product_id;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `update_product_rating_after_review_update` AFTER UPDATE ON `product_reviews` FOR EACH ROW BEGIN
  UPDATE products
  SET 
    rating = COALESCE((
      SELECT AVG(rating) 
      FROM product_reviews 
      WHERE product_id = NEW.product_id AND is_approved = TRUE
    ), 0.00),
    reviews_count = COALESCE((
      SELECT COUNT(*) 
      FROM product_reviews 
      WHERE product_id = NEW.product_id AND is_approved = TRUE
    ), 0)
  WHERE id = NEW.product_id;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `review_helpful`
--

CREATE TABLE `review_helpful` (
  `id` int(11) NOT NULL,
  `review_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `review_helpful`
--

INSERT INTO `review_helpful` (`id`, `review_id`, `user_id`, `created_at`) VALUES
(1, 1, 2, '2026-01-26 12:19:45');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','employee','customer') NOT NULL DEFAULT 'customer',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `is_active` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `created_at`, `updated_at`, `is_active`) VALUES
(1, 'أحمد محمد', 'ahmed@test.com', '$2a$10$rPnQpG5uR28EztMPnd8nWulwo4s/NttZbezNwIDE2tK97jAtTjGiC', 'admin', '2026-01-18 10:19:26', '2026-01-18 10:21:02', 1),
(2, 'ali', 'ali@test.com', '$2a$10$u3xxGwhYiBUYLA4NeSDy7.a16WFmn6eD.hJMA2wpqGXlqeR8FQ9vu', 'employee', '2026-01-18 10:33:01', '2026-01-18 10:33:28', 1),
(6, 'احمد علي علي', 'admin@ak.com', '$2a$10$jrHb95ZkT2oyQMbA1/0Kr.5Um564e0hUldg7E1ekiaOfW99qXxYTG', 'customer', '2026-01-25 13:07:34', '2026-01-25 13:07:34', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_is_active` (`is_active`),
  ADD KEY `idx_slug` (`slug`);

--
-- Indexes for table `customer_discounts`
--
ALTER TABLE `customer_discounts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_customer_id` (`customer_id`),
  ADD KEY `idx_dates` (`start_date`,`end_date`),
  ADD KEY `idx_is_active` (`is_active`);

--
-- Indexes for table `employee_permissions`
--
ALTER TABLE `employee_permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_employee_permission` (`employee_id`,`permission_type`),
  ADD KEY `idx_employee_id` (`employee_id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_order_id` (`order_id`),
  ADD KEY `idx_product_id` (`product_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_category_id` (`category_id`),
  ADD KEY `idx_slug` (`slug`),
  ADD KEY `idx_is_active` (`is_active`);

--
-- Indexes for table `product_images`
--
ALTER TABLE `product_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_product_id` (`product_id`),
  ADD KEY `idx_is_primary` (`is_primary`),
  ADD KEY `idx_display_order` (`display_order`);

--
-- Indexes for table `product_reviews`
--
ALTER TABLE `product_reviews`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_product_review` (`user_id`,`product_id`),
  ADD KEY `idx_product_id` (`product_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_rating` (`rating`),
  ADD KEY `idx_is_approved` (`is_approved`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `review_helpful`
--
ALTER TABLE `review_helpful`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_review_helpful` (`user_id`,`review_id`),
  ADD KEY `idx_review_id` (`review_id`),
  ADD KEY `idx_user_id` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `customer_discounts`
--
ALTER TABLE `customer_discounts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `employee_permissions`
--
ALTER TABLE `employee_permissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `product_images`
--
ALTER TABLE `product_images`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `product_reviews`
--
ALTER TABLE `product_reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `review_helpful`
--
ALTER TABLE `review_helpful`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `customer_discounts`
--
ALTER TABLE `customer_discounts`
  ADD CONSTRAINT `customer_discounts_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `customer_discounts_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `employee_permissions`
--
ALTER TABLE `employee_permissions`
  ADD CONSTRAINT `employee_permissions_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `product_images`
--
ALTER TABLE `product_images`
  ADD CONSTRAINT `product_images_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `product_reviews`
--
ALTER TABLE `product_reviews`
  ADD CONSTRAINT `product_reviews_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `product_reviews_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `review_helpful`
--
ALTER TABLE `review_helpful`
  ADD CONSTRAINT `review_helpful_ibfk_1` FOREIGN KEY (`review_id`) REFERENCES `product_reviews` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `review_helpful_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
