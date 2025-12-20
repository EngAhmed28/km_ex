
import { Product, Category } from '../types';

export const categories: Category[] = [
  { id: '1', nameAr: 'مكملات بروتين', nameEn: 'Protein Supplements', image: '/images/1.webp', slug: 'proteins' },
  { id: '2', nameAr: 'الماس جينر وزيادة الوزن', nameEn: 'Mass Gainer', image: '/images/2.webp', slug: 'mass-gainer' },
  { id: '3', nameAr: 'مكملات الكرياتين', nameEn: 'Creatine', image: '/images/3.webp', slug: 'creatine' },
  { id: '4', nameAr: 'محفزات تستسترون', nameEn: 'Testosterone Boosters', image: '/images/5.webp', slug: 'testosterone' },
  { id: '5', nameAr: 'حوارق دهون', nameEn: 'Fat Burners', image: '/images/7.webp', slug: 'fat-burners' },
  { id: '6', nameAr: 'مكملات طاقة', nameEn: 'Pre-Workout', image: '/images/8.webp', slug: 'energy' },
  { id: '7', nameAr: 'احماض امينية', nameEn: 'Amino Acids', image: '/images/9.webp', slug: 'amino-acids' },
  { id: '8', nameAr: 'مكملات كربوهيدرات', nameEn: 'Carbohydrates', image: '/images/6.webp', slug: 'carbs' },
  { id: '9', nameAr: 'معادن وفيتامينات', nameEn: 'Vitamins & Minerals', image: '/images/10.webp', slug: 'vitamins' },
  { id: '10', nameAr: 'منتجات اخرى', nameEn: 'Other Products', image: '/images/4.webp', slug: 'others' },
];
export const products: Product[] = [
  // Protein Supplements
  {
    id: 'p1',
    nameAr: 'واي بروتين آيزوليت - 2.27 كجم',
    nameEn: 'Whey Protein Isolate - 2.27kg',
    price: 350,
    oldPrice: 420,
    image: '/images/prot1.jpg',
    category: 'proteins',
    descriptionAr: 'أنقى أنواع البروتين لبناء العضلات والتعافي السريع.',
    descriptionEn: 'Purest form of protein for muscle building and fast recovery.',
    rating: 4.8,
    reviewsCount: 124,
    weight: '2.27kg',
    flavor: ['Chocolate', 'Vanilla', 'Strawberry'],
    stock: 15,
    nutrition: [
      { labelAr: 'البروتين', labelEn: 'Protein', value: '25g' },
      { labelAr: 'الكربوهيدرات', labelEn: 'Carbs', value: '2g' },
      { labelAr: 'الدهون', labelEn: 'Fat', value: '1g' },
      { labelAr: 'السعرات', labelEn: 'Calories', value: '120' },
    ]
  },
  {
    id: 'p5',
    nameAr: 'كازين بروتين - امتصاص بطيء',
    nameEn: 'Casein Protein - Slow Absorption',
    price: 280,
    image: '/images/prot2.png',
    category: 'proteins',
    descriptionAr: 'مثالي للاستخدام قبل النوم لتغذية العضلات طوال الليل.',
    descriptionEn: 'Perfect for pre-bedtime use to feed muscles throughout the night.',
    rating: 4.7,
    reviewsCount: 56,
    weight: '1.8kg',
    flavor: ['Chocolate Silk', 'Creamy Vanilla'],
    stock: 25,
    nutrition: [
      { labelAr: 'بروتين بطيء', labelEn: 'Slow Protein', value: '24g' },
      { labelAr: 'جلوتامين', labelEn: 'Glutamine', value: '5g' },
    ]
  },
  // Mass Gainer
  {
    id: 'p6',
    nameAr: 'سيرياس ماس - زيادة ضخمة',
    nameEn: 'Serious Mass - High Calorie',
    price: 320,
    oldPrice: 380,
    image: '/images/mass1.png',
    category: 'mass-gainer',
    descriptionAr: 'أفضل حل لزيادة الوزن والكتلة العضلية للأشخاص النحفاء.',
    descriptionEn: 'The best solution for weight and muscle mass gain for thin individuals.',
    rating: 4.6,
    reviewsCount: 210,
    weight: '5.4kg',
    flavor: ['Chocolate', 'Banana'],
    stock: 12,
    nutrition: [
      { labelAr: 'سعرات', labelEn: 'Calories', value: '1250' },
      { labelAr: 'بروتين', labelEn: 'Protein', value: '50g' },
      { labelAr: 'كربوهيدرات', labelEn: 'Carbs', value: '250g' },
    ]
  },
  // Creatine
  {
    id: 'p2',
    nameAr: 'كرياتين مونوهيدرات نقي',
    nameEn: 'Pure Creatine Monohydrate',
    price: 120,
    image: '/images/createn1.jpeg',
    category: 'creatine',
    descriptionAr: 'لزيادة القوة البدنية وتحسين الأداء الرياضي.',
    descriptionEn: 'To increase physical strength and improve athletic performance.',
    rating: 4.9,
    reviewsCount: 89,
    weight: '300g',
    flavor: ['Unflavored'],
    stock: 50,
    nutrition: [
      { labelAr: 'كرياتين', labelEn: 'Creatine', value: '5g' },
    ]
  },
  {
    id: 'p7',
    nameAr: 'كرياتين HCL متطور',
    nameEn: 'Advanced Creatine HCL',
    price: 180,
    image: '/images/createn2.webp',
    category: 'creatine',
    descriptionAr: 'امتصاص أسرع بدون احتباس سوائل تحت الجلد.',
    descriptionEn: 'Faster absorption without water retention under the skin.',
    rating: 4.8,
    reviewsCount: 42,
    weight: '120g',
    flavor: ['Blue Raspberry', 'Fruit Punch'],
    stock: 30,
    nutrition: [
      { labelAr: 'HCL كرياتين', labelEn: 'Creatine HCL', value: '2g' },
    ]
  },
  // Fat Burners
  {
    id: 'p4',
    nameAr: 'حارق دهون متطور',
    nameEn: 'Advanced Fat Burner',
    price: 210,
    oldPrice: 250,
    image: '/images/burn.webp',
    category: 'fat-burners',
    descriptionAr: 'يساعد في تسريع عملية التمثيل الغذائي وحرق السعرات.',
    descriptionEn: 'Helps accelerate metabolism and burn calories.',
    rating: 4.2,
    reviewsCount: 67,
    weight: '90 Capsules',
    flavor: ['Capsules'],
    stock: 20,
    nutrition: [
      { labelAr: 'كافيين', labelEn: 'Caffeine', value: '200mg' },
      { labelAr: 'إل-كارنتين', labelEn: 'L-Carnitine', value: '500mg' },
    ]
  },
  // Energy / Pre-Workout
  {
    id: 'p8',
    nameAr: 'مكمل طاقة قبل التمرين - C4',
    nameEn: 'Pre-Workout Energy - C4',
    price: 195,
    image: '/images/mens.webp',
    category: 'energy',
    descriptionAr: 'طاقة هائلة وتركيز عالي لأداء تمرين استثنائي.',
    descriptionEn: 'Explosive energy and high focus for an exceptional workout.',
    rating: 4.7,
    reviewsCount: 154,
    weight: '30 Servings',
    flavor: ['Icy Blue Razz', 'Fruit Punch', 'Watermelon'],
    stock: 40,
    nutrition: [
      { labelAr: 'كافيين', labelEn: 'Caffeine', value: '150mg' },
      { labelAr: 'بيتا ألانين', labelEn: 'Beta-Alanine', value: '1.6g' },
      { labelAr: 'كرياتين', labelEn: 'Creatine Nitrate', value: '1g' },
    ]
  },
  // Vitamins & Minerals
  {
    id: 'p3',
    nameAr: 'ملتي فيتامين للرياضيين',
    nameEn: 'Athlete Multi-Vitamin',
    price: 95,
    image: '/images/vit1.png',
    category: 'vitamins',
    descriptionAr: 'مزيج متكامل من المعادن والفيتامينات لصحة أفضل.',
    descriptionEn: 'A complete blend of minerals and vitamins for better health.',
    rating: 4.5,
    reviewsCount: 45,
    weight: '60 Capsules',
    flavor: ['Capsules'],
    stock: 100,
    nutrition: [
      { labelAr: 'فيتامين C', labelEn: 'Vitamin C', value: '500mg' },
      { labelAr: 'فيتامين D', labelEn: 'Vitamin D', value: '1000IU' },
    ]
  },
];
