import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads/categories');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `category-${uniqueSuffix}${ext}`);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('نوع الملف غير مدعوم. يرجى اختيار صورة (JPG, PNG, WEBP, GIF)'));
  }
};

// Configure multer
export const uploadCategoryImage = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: fileFilter
}).single('image');

// Create products upload directory if it doesn't exist
const productsUploadsDir = path.join(__dirname, '../uploads/products');
if (!fs.existsSync(productsUploadsDir)) {
  fs.mkdirSync(productsUploadsDir, { recursive: true });
}

// Configure storage for products
const productStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, productsUploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `product-${uniqueSuffix}${ext}`);
  }
});

// Configure multer for products (single image)
export const uploadProductImage = multer({
  storage: productStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: fileFilter
}).single('image');

// Configure multer for products (multiple images)
export const uploadProductImages = multer({
  storage: productStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 10 // Maximum 10 files
  },
  fileFilter: fileFilter
}).array('images', 10); // Accept up to 10 images

// Create brands upload directory if it doesn't exist
const brandsUploadsDir = path.join(__dirname, '../uploads/brands');
if (!fs.existsSync(brandsUploadsDir)) {
  fs.mkdirSync(brandsUploadsDir, { recursive: true });
}

// Configure storage for brands
const brandStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, brandsUploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `brand-${uniqueSuffix}${ext}`);
  }
});

// Configure multer for brands
export const uploadBrandImage = multer({
  storage: brandStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: fileFilter
}).single('image');

// Create deals upload directory if it doesn't exist
const dealsUploadsDir = path.join(__dirname, '../uploads/deals');
if (!fs.existsSync(dealsUploadsDir)) {
  fs.mkdirSync(dealsUploadsDir, { recursive: true });
}

// Configure storage for deals
const dealStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, dealsUploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `deal-${uniqueSuffix}${ext}`);
  }
});

// Configure multer for deals
export const uploadDealImage = multer({
  storage: dealStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: fileFilter
}).single('image');

// Create logo upload directory if it doesn't exist
const logoUploadsDir = path.join(__dirname, '../uploads/logo');
if (!fs.existsSync(logoUploadsDir)) {
  fs.mkdirSync(logoUploadsDir, { recursive: true });
}

// Configure storage for logo
const logoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, logoUploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `logo-${uniqueSuffix}${ext}`);
  }
});

// Configure multer for logo
export const uploadLogoImage = multer({
  storage: logoStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: fileFilter
}).single('image');
