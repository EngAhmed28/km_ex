
export type Language = 'ar' | 'en';

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Product {
  id: string;
  nameAr: string;
  nameEn: string;
  price: number;
  oldPrice?: number;
  image: string;
  images?: string[]; // Multiple images array
  category: string;
  descriptionAr: string;
  descriptionEn: string;
  rating: number;
  reviewsCount: number;
  weight: string;
  flavor: string[];
  stock: number;
  nutrition: {
    labelAr: string;
    labelEn: string;
    value: string;
  }[];
  // Additional fields
  country_of_origin?: string;
  expiry_date?: string;
  manufacture_date?: string;
  ingredients?: string[];
  usage_instructions_ar?: string;
  usage_instructions_en?: string;
  safety_warnings_ar?: string;
  safety_warnings_en?: string;
  category_id?: number;
  is_active?: boolean;
}

export interface Category {
  id: string;
  nameAr: string;
  nameEn: string;
  image: string;
  slug: string;
}

export interface CartItem extends Product {
  quantity: number;
  selectedFlavor: string;
}
