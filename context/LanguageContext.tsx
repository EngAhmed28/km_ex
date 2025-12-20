
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '../types';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  ar: {
    home: 'الرئيسية',
    shop: 'المتجر',
    categories: 'الأقسام',
    about: 'عن المتجر',
    login: 'تسجيل الدخول',
    signup: 'إنشاء حساب',
    logout: 'تسجيل الخروج',
    search: 'ابحث عن مكملك...',
    cart: 'السلة',
    heroTitle: 'أطلق الوحش الذي بداخلك',
    heroSub: 'أفضل المكملات الغذائية العالمية لبناء العضلات والأداء الرياضي المثالي.',
    shopNow: 'تسوق الآن',
    featured: 'أفضل المنتجات',
    newArrivals: 'وصل حديثاً',
    footerAbout: 'King of Muscles هو وجهتك الأولى للحصول على أجود أنواع المكملات الغذائية في العالم العربي.',
    rights: 'جميع الحقوق محفوظة © 2024',
    addToCart: 'أضف للسلة',
    bestSellers: 'الأكثر مبيعاً',
    newArrivals: 'المنتجات الجديدة',
    reviews: 'تقييمات العملاء',
    price: 'السعر',
    weight: 'الوزن',
    flavor: 'النكهة',
    quantity: 'الكمية',
    description: 'الوصف',
    nutritionFacts: 'القيم الغذائية',
    similarProducts: 'منتجات مشابهة',
    checkout: 'إتمام الطلب',
    emptyCart: 'سلة المشتريات فارغة',
    total: 'الإجمالي',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    forgotPassword: 'نسيت كلمة المرور؟',
    dontHaveAccount: 'ليس لديك حساب؟',
    haveAccount: 'لديك حساب بالفعل؟',
    confirmPassword: 'تأكيد كلمة المرور',
    filterBy: 'تصفية حسب',
    sortBy: 'ترتيب حسب',
    all: 'الكل',
    clearAll: 'مسح الكل',
    customSearch: 'بحث مخصص',
    searchHere: 'ابحث هنا...',
    wishlistOnly: 'المفضلة فقط',
    noResults: 'لا توجد نتائج',
    resetFilters: 'إعادة ضبط الفلاتر',
    orderSummary: 'ملخص الطلب',
    subtotal: 'المجموع الفرعي',
    shipping: 'الشحن',
    free: 'مجاناً',
    discountCode: 'كود الخصم',
    apply: 'تطبيق',
    addedSuccess: 'تمت الإضافة بنجاح!',
    checkoutNow: 'إنهاء الطلب الآن',
    original: 'أصلي 100%',
    fastDelivery: 'شحن سريع',
    easyReturn: 'إرجاع سهل',
    exclusiveOffers: 'عروض حصرية',
    promoTitle: 'احصل على خصم 20% على طلبك الأول',
    promoSub: 'اشترك في قائمتنا البريدية وكن أول من يعرف عن أحدث المكملات والعروض الحصرية.',
    subscribe: 'اشترك',
    fullName: 'الاسم بالكامل',
    welcomeBack: 'أهلاً بك في متجر الأبطال',
    loading: 'جاري التحميل...',
    viewDetails: 'عرض التفاصيل',
    bigOffer: 'عرض كبير',
    specialOffers: 'العروض الخاصة',
    support: 'الدعم الفني',
    faqs: 'الأسئلة الشائعة',
    returnPolicy: 'سياسة الإرجاع',
    shippingDelivery: 'الشحن والتوصيل',
    contactUs: 'اتصل بنا',
    connectWithUs: 'تواصل معنا',
    address: 'الرياض، المملكة العربية السعودية - شارع التحلية',
    shopByGoal: 'تسوق حسب هدفك',
    goalMuscle: 'بناء العضلات',
    goalWeight: 'خسارة الوزن',
    goalEnergy: 'الطاقة والتحمل',
    goalHealth: 'الصحة العامة',
    trustedBy: 'موثوق من قبل الأبطال',
    happyCustomers: 'عميل سعيد',
    originalProducts: 'منتج أصلي',
    yearsExperience: 'سنوات خبرة',
    ourBrands: 'شركاء النجاح',
    trustedBrands: 'البراندات العالمية الأكثر ثقة',
    latestNews: 'آخر الأخبار والنصائح',
    readMore: 'اقرأ المزيد',
    joinTribe: 'انضم إلى مجتمعنا على إنستغرام',
    dealOfTheDay: 'صفقة اليوم',
    massiveDeal: 'صفقة ضخمة على البروتين',
    endsIn: 'ينتهي خلال',
    hours: 'ساعة',
    minutes: 'دقيقة',
    seconds: 'ثانية',
    claimOffer: 'احصل على العرض الآن',
  },
  en: {
    home: 'Home',
    shop: 'Shop',
    categories: 'Categories',
    about: 'About',
    login: 'Login',
    signup: 'Sign Up',
    logout: 'Logout',
    search: 'Search for supplements...',
    cart: 'Cart',
    heroTitle: 'Unleash Your Inner Beast',
    heroSub: 'Premium global supplements for muscle building and peak athletic performance.',
    shopNow: 'Shop Now',
    featured: 'Featured Products',
    newArrivals: 'New Arrivals',
    footerAbout: 'King of Muscles is your primary destination for the highest quality supplements in the Arab world.',
    rights: 'All Rights Reserved © 2024',
    addToCart: 'Add to Cart',
    bestSellers: 'Best Sellers',
    newArrivals: 'New Arrivals',
    reviews: 'Customer Reviews',
    price: 'Price',
    weight: 'Weight',
    flavor: 'Flavor',
    quantity: 'Quantity',
    description: 'Description',
    nutritionFacts: 'Nutrition Facts',
    similarProducts: 'Similar Products',
    checkout: 'Checkout',
    emptyCart: 'Cart is empty',
    total: 'Total',
    email: 'Email',
    password: 'Password',
    forgotPassword: 'Forgot Password?',
    dontHaveAccount: "Don't have an account?",
    haveAccount: 'Already have an account?',
    confirmPassword: 'Confirm Password',
    filterBy: 'Filter By',
    sortBy: 'Sort By',
    all: 'All',
    clearAll: 'Clear All',
    customSearch: 'Custom Search',
    searchHere: 'Search here...',
    wishlistOnly: 'Wishlist Only',
    noResults: 'No Results Found',
    resetFilters: 'Reset Filters',
    orderSummary: 'Order Summary',
    subtotal: 'Subtotal',
    shipping: 'Shipping',
    free: 'Free',
    discountCode: 'Discount Code',
    apply: 'Apply',
    addedSuccess: 'Added Successfully!',
    checkoutNow: 'Checkout Now',
    original: '100% Original',
    fastDelivery: 'Fast Delivery',
    easyReturn: 'Easy Returns',
    exclusiveOffers: 'Exclusive Offers',
    promoTitle: 'Get 20% Off Your First Order',
    promoSub: 'Subscribe to our newsletter and be the first to know about the latest supplements and offers.',
    subscribe: 'Subscribe',
    fullName: 'Full Name',
    welcomeBack: 'Welcome to the Champions Store',
    loading: 'Loading...',
    viewDetails: 'View Details',
    bigOffer: 'Big Offer',
    specialOffers: 'Special Offers',
    support: 'Support',
    faqs: 'FAQs',
    returnPolicy: 'Return Policy',
    shippingDelivery: 'Shipping & Delivery',
    contactUs: 'Contact Us',
    connectWithUs: 'Connect With Us',
    address: 'Riyadh, Saudi Arabia - Tahlia St.',
    shopByGoal: 'Shop by Goal',
    goalMuscle: 'Build Muscle',
    goalWeight: 'Lose Weight',
    goalEnergy: 'Energy & Focus',
    goalHealth: 'General Health',
    trustedBy: 'Trusted by Champions',
    happyCustomers: 'Happy Customers',
    originalProducts: 'Original Products',
    yearsExperience: 'Years Experience',
    ourBrands: 'Our Brands',
    trustedBrands: 'Most Trusted Global Brands',
    latestNews: 'Latest Tips & News',
    readMore: 'Read More',
    joinTribe: 'Join the Tribe on Instagram',
    dealOfTheDay: 'Deal of the Day',
    massiveDeal: 'MASSIVE DEAL ON WHEY',
    endsIn: 'Ends in',
    hours: 'Hrs',
    minutes: 'Mins',
    seconds: 'Secs',
    claimOffer: 'Claim Offer Now',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLang] = useState<Language>('ar');

  const setLanguage = (lang: Language) => {
    setLang(lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  };

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, []);

  const t = (key: string) => translations[language][key] || key;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      <div dir={language === 'ar' ? 'rtl' : 'ltr'} className={language === 'ar' ? 'font-ar' : 'font-en'}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
