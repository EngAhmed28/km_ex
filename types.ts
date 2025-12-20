
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
