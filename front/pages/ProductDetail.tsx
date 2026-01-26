
import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { productsAPI, reviewAPI } from '../utils/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useDiscount } from '../context/DiscountContext';
import { useAuth } from '../context/AuthContext';
import { calculateDiscountedPrice, isDiscountActive } from '../utils/discount';
import { Product } from '../types';
import { 
  Star, 
  ShieldCheck, 
  Truck, 
  Zap, 
  Plus, 
  Minus, 
  Share2, 
  Heart, 
  RotateCcw, 
  Check, 
  ShoppingBag,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X as XIcon,
  MapPin,
  Calendar,
  Package,
  Info,
  MessageSquare,
  ThumbsUp,
  AlertTriangle
} from 'lucide-react';
import ProductCard from '../components/ProductCard';

interface ProductDetailProps {
  id: string;
  onNavigate: (page: string, params?: any) => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ id, onNavigate }) => {
  const { t, language } = useLanguage();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { customerDiscount } = useDiscount();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'description' | 'nutrition' | 'reviews'>('description');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Reviews state
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: ''
  });
  const [submittingReview, setSubmittingReview] = useState(false);

  // Fetch reviews
  const fetchReviews = async () => {
    if (!id) return;
    try {
      setReviewsLoading(true);
      const response = await reviewAPI.getProductReviews(id);
      if (response.success && response.data && response.data.reviews) {
        setReviews(response.data.reviews);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setReviewsLoading(false);
    }
  };

  // Check if user has reviewed
  const checkUserReview = async () => {
    if (!id || !user) return;
    try {
      const response = await reviewAPI.getUserReview(id);
      if (response.success && response.data) {
        setHasReviewed(response.data.hasReviewed);
      }
    } catch (error) {
      console.error('Error checking user review:', error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchReviews();
      checkUserReview();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user?.id]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await productsAPI.getProductById(id);
        
        if (response.success && response.data && response.data.product) {
          const prod = response.data.product;
          // Convert relative path to full URL if needed
          let imageUrl = prod.image || null;
          if (imageUrl && !imageUrl.startsWith('http') && imageUrl.startsWith('/')) {
            imageUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${imageUrl}`;
          }
          
          // Process images array
          let imagesArray: string[] = [];
          if (prod.images && Array.isArray(prod.images) && prod.images.length > 0) {
            imagesArray = prod.images.map((img: string) => {
              if (img && !img.startsWith('http') && img.startsWith('/')) {
                return `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${img}`;
              }
              return img;
            });
          } else if (imageUrl) {
            imagesArray = [imageUrl];
          }
          
          setProduct({
            ...prod,
            image: imageUrl || '',
            images: imagesArray
          });
        } else {
          setError(language === 'ar' ? 'المنتج غير موجود' : 'Product not found');
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err instanceof Error ? err.message : (language === 'ar' ? 'حدث خطأ أثناء تحميل المنتج' : 'An error occurred while loading product'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [id, language]);

  useEffect(() => {
    setQuantity(1);
  }, [id]);

  useEffect(() => {
    if (isAdded) {
      const timer = setTimeout(() => setIsAdded(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isAdded]);

  const handleAddToCart = () => {
    if (!product) return;
    setIsAdding(true);
    setTimeout(() => {
      addToCart(product, quantity, product.flavor && product.flavor.length > 0 ? product.flavor[0] : '');
      setQuantity(1);
      setIsAdding(false);
      setIsAdded(true);
    }, 600);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const scrollAmount = clientWidth * 0.8;
      const multiplier = language === 'ar' ? (direction === 'left' ? 1 : -1) : (direction === 'left' ? -1 : 1);
      
      scrollContainerRef.current.scrollTo({
        left: scrollLeft + (scrollAmount * multiplier),
        behavior: 'smooth'
      });
    }
  };

  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (product) {
      const fetchSimilar = async () => {
        try {
          const response = await productsAPI.getAllProducts({ category: product.category });
          if (response.success && response.data && response.data.products) {
            const similar = response.data.products
              .filter((p: Product) => p.id !== product.id)
              .slice(0, 4)
              .map((p: any) => {
                let imageUrl = p.image || null;
                if (imageUrl && !imageUrl.startsWith('http') && imageUrl.startsWith('/')) {
                  imageUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${imageUrl}`;
                }
                return { ...p, image: imageUrl || '' };
              });
            setSimilarProducts(similar);
          }
        } catch (err) {
          console.error('Error fetching similar products:', err);
        }
      };
      fetchSimilar();
    }
  }, [product]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center items-center py-32">
          <Loader2 className="animate-spin h-16 w-16 text-primary" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center items-center py-32">
          <div className="text-center">
            <p className="text-red-500 font-bold mb-4">{error || (language === 'ar' ? 'المنتج غير موجود' : 'Product not found')}</p>
            <button
              onClick={() => onNavigate('shop')}
              className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-secondary transition-all"
            >
              {language === 'ar' ? 'العودة للمتجر' : 'Back to Shop'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isLiked = isInWishlist(product.id);

  return (
    <div className="pb-20">
      {/* Success Toast */}
      {isAdded && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-10 duration-500">
          <div className="bg-secondary text-white px-8 py-5 rounded-[2rem] shadow-2xl flex items-center gap-5 border border-primary/20 backdrop-blur-xl">
            <div className="bg-primary p-3 rounded-2xl animate-bounce">
              <Check size={24} />
            </div>
            <div>
              <p className="font-black text-sm uppercase italic">{t('addedSuccess')}</p>
              <button onClick={() => onNavigate('cart')} className="text-primary text-[10px] font-black uppercase hover:underline tracking-widest">{t('checkoutNow')}</button>
            </div>
            <button onClick={() => setIsAdded(false)} className="text-gray-500 hover:text-white transition-colors">
              <XIcon size={18} />
            </button>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 mb-8 tracking-[0.2em]">
          <button onClick={() => onNavigate('home')} className="hover:text-primary">{t('home')}</button>
          <span>/</span>
          <button onClick={() => onNavigate('shop')} className="hover:text-primary">{t('shop')}</button>
          <span>/</span>
          <span className="text-secondary">{language === 'ar' ? product.nameAr : product.nameEn}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div className="space-y-6">
            {/* Main Image */}
            <div className="bg-accent rounded-[4rem] p-12 aspect-square flex items-center justify-center relative group overflow-hidden border border-gray-100 shadow-sm">
              <img 
                src={(product.images && product.images.length > 0) ? product.images[selectedImageIndex] : product.image} 
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700 ease-out" 
                alt={product.nameEn} 
              />
              
              <div className="absolute top-8 left-8 flex flex-col gap-3">
                <button 
                  onClick={() => toggleWishlist(product.id)}
                  className={`p-4 bg-white/90 backdrop-blur-md rounded-[1.5rem] shadow-xl transition-all ${isLiked ? 'text-primary scale-110' : 'text-gray-400 hover:text-primary hover:scale-110'}`} 
                >
                  <Heart size={22} fill={isLiked ? "currentColor" : "none"} />
                </button>
                <button 
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: language === 'ar' ? product.nameAr : product.nameEn,
                        text: language === 'ar' ? product.descriptionAr : product.descriptionEn,
                        url: window.location.href
                      });
                    }
                  }}
                  className="p-4 bg-white/90 backdrop-blur-md rounded-[1.5rem] shadow-xl transition-all text-gray-400 hover:text-primary hover:scale-110"
                >
                  <Share2 size={22} />
                </button>
              </div>

              {product.oldPrice && (
                <div className="absolute top-8 right-8 bg-primary text-white text-xs font-black px-4 py-2 rounded-2xl shadow-xl italic uppercase">
                  {t('bigOffer')}
                </div>
              )}
            </div>
            
            {/* Image Gallery */}
            {(product.images && product.images.length > 1) && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index 
                        ? 'border-primary shadow-lg scale-105' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img src={img} alt={`${product.nameEn} ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-10">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-7xl font-black italic uppercase leading-[1.1] text-secondary">
                {language === 'ar' ? product.nameAr : product.nameEn}
              </h1>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-1.5">
                  <Star className="text-yellow-400 fill-yellow-400" size={20} />
                  <span className="font-black text-lg ml-2">{product.rating}</span>
                </div>
                <div className="h-6 w-px bg-gray-200"></div>
                <span className="text-gray-400 text-sm font-bold uppercase tracking-widest">{product.reviewsCount} {t('reviews')}</span>
              </div>
            </div>

            <div className="flex items-end gap-6">
              <div className="flex flex-col">
                {(() => {
                  const hasDiscount = customerDiscount && isDiscountActive(customerDiscount);
                  const discountedPrice = calculateDiscountedPrice(product.price, customerDiscount);
                  
                  if (hasDiscount && discountedPrice < product.price) {
                    return (
                      <>
                        <span className="text-6xl font-black text-primary italic">
                          <span className="text-primary line-through opacity-50 text-4xl">
                            {product.price}
                          </span>
                          {' '}
                          {discountedPrice.toFixed(2)} <span className="text-2xl font-normal not-italic opacity-60">{language === 'ar' ? 'ج.م' : 'EGP'}</span>
                        </span>
                        <span className="text-green-600 text-sm font-bold mt-2">
                          {language === 'ar' ? `خصم ${customerDiscount?.discount_percentage}%` : `${customerDiscount?.discount_percentage}% OFF`}
                        </span>
                      </>
                    );
                  }
                  return (
                    <>
                      <span className="text-6xl font-black text-primary italic">
                        {product.price} <span className="text-2xl font-normal not-italic opacity-60">{language === 'ar' ? 'ج.م' : 'EGP'}</span>
                      </span>
                      {product.oldPrice && (
                        <span className="text-2xl text-gray-400 line-through font-bold mt-2">
                          {product.oldPrice} {language === 'ar' ? 'ج.م' : 'EGP'}
                        </span>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Product Details */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              {product.weight && (
                <div className="flex items-center gap-3 p-4 bg-accent/50 rounded-2xl">
                  <Package size={20} className="text-primary" />
                  <div>
                    <p className="text-xs font-black uppercase text-gray-500">{language === 'ar' ? 'الوزن' : 'Weight'}</p>
                    <p className="text-sm font-bold">{product.weight}</p>
                  </div>
                </div>
              )}
              {product.stock > 0 && (
                <div className="flex items-center gap-3 p-4 bg-accent/50 rounded-2xl">
                  <Check size={20} className="text-green-500" />
                  <div>
                    <p className="text-xs font-black uppercase text-gray-500">{language === 'ar' ? 'المتاح' : 'In Stock'}</p>
                    <p className="text-sm font-bold text-green-600">{product.stock} {language === 'ar' ? 'قطعة' : 'items'}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Flavor Selection */}
            {product.flavor && product.flavor.length > 0 && (
              <div className="pt-4">
                <p className="text-sm font-black uppercase text-gray-700 mb-3">{language === 'ar' ? 'النكهات المتاحة' : 'Available Flavors'}</p>
                <div className="flex flex-wrap gap-3">
                  {product.flavor.map((flavor, index) => (
                    <span key={index} className="px-4 py-2 bg-accent rounded-xl text-sm font-bold border-2 border-gray-200">
                      {flavor}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-stretch gap-6 pt-6">
              <div className="flex items-center bg-accent rounded-[2rem] p-2 shadow-inner border border-gray-100 h-20 sm:w-56 shrink-0">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-16 h-full flex items-center justify-center hover:bg-white rounded-[1.5rem] transition-all"><Minus size={22}/></button>
                <span className="w-full text-center font-black text-3xl italic">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="w-16 h-full flex items-center justify-center hover:bg-white rounded-[1.5rem] transition-all"><Plus size={22}/></button>
              </div>

              <button 
                onClick={handleAddToCart}
                disabled={isAdding}
                className={`flex-grow font-black h-20 rounded-[2rem] text-xl flex items-center justify-center gap-4 transition-all shadow-2xl ${isAdded ? 'bg-green-600' : 'bg-primary hover:bg-secondary'} text-white`}
              >
                {isAdding ? <Loader2 className="animate-spin" size={28}/> : (isAdded ? <Check size={28}/> : <ShoppingBag size={28}/>)}
                {isAdded ? t('addedSuccess') : t('addToCart')}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-10 border-t border-gray-100">
              {[
                { icon: <Truck size={28} />, label: t('fastDelivery') },
                { icon: <ShieldCheck size={28} />, label: t('original') },
                { icon: <RotateCcw size={28} />, label: t('easyReturn') }
              ].map((b, i) => (
                <div key={i} className="text-center p-6 bg-accent/30 rounded-3xl space-y-3">
                  <div className="text-primary mx-auto">{b.icon}</div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">{b.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-32">
          <div className="flex gap-4 border-b-2 border-gray-200 mb-8">
            <button
              onClick={() => setActiveTab('description')}
              className={`px-6 py-4 font-black uppercase text-sm transition-all ${
                activeTab === 'description'
                  ? 'text-primary border-b-2 border-primary -mb-[2px]'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {language === 'ar' ? 'الوصف التفصيلي' : 'Detailed Description'}
            </button>
            <button
              onClick={() => setActiveTab('nutrition')}
              className={`px-6 py-4 font-black uppercase text-sm transition-all ${
                activeTab === 'nutrition'
                  ? 'text-primary border-b-2 border-primary -mb-[2px]'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {t('nutritionFacts')}
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-6 py-4 font-black uppercase text-sm transition-all ${
                activeTab === 'reviews'
                  ? 'text-primary border-b-2 border-primary -mb-[2px]'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {t('reviews')} ({reviews.length})
            </button>
          </div>

          {/* Description Tab */}
          {activeTab === 'description' && (
            <div className="space-y-8 bg-white p-8 rounded-3xl border border-gray-100">
              <div>
                <h3 className="text-2xl font-black mb-4">{language === 'ar' ? 'وصف المنتج' : 'Product Description'}</h3>
                <p className="text-gray-600 leading-relaxed font-bold text-lg">
                  {language === 'ar' ? product.descriptionAr : product.descriptionEn}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-gray-200">
                <div>
                  <h4 className="text-xl font-black mb-4 flex items-center gap-2">
                    <Info size={20} className="text-primary" />
                    {language === 'ar' ? 'المكونات الأساسية' : 'Key Ingredients'}
                  </h4>
                  <ul className="space-y-2 text-gray-600 font-bold">
                    {product.flavor && product.flavor.length > 0 && (
                      <li className="flex items-center gap-2">
                        <Check size={16} className="text-green-500" />
                        {language === 'ar' ? 'نكهات متعددة' : 'Multiple flavors available'}
                      </li>
                    )}
                    <li className="flex items-center gap-2">
                      <Check size={16} className="text-green-500" />
                      {language === 'ar' ? 'مكونات طبيعية 100%' : '100% Natural ingredients'}
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={16} className="text-green-500" />
                      {language === 'ar' ? 'خالي من المواد الحافظة' : 'Preservative-free'}
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-xl font-black mb-4 flex items-center gap-2">
                    <Zap size={20} className="text-primary" />
                    {language === 'ar' ? 'طريقة الاستخدام' : 'Usage Instructions'}
                  </h4>
                  <ul className="space-y-2 text-gray-600 font-bold">
                    <li className="flex items-center gap-2">
                      <Check size={16} className="text-green-500" />
                      {language === 'ar' ? 'اخلط ملعقة واحدة مع 250-300 مل من الماء' : 'Mix one scoop with 250-300ml of water'}
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={16} className="text-green-500" />
                      {language === 'ar' ? 'تناول بعد التمرين مباشرة' : 'Take immediately after workout'}
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={16} className="text-green-500" />
                      {language === 'ar' ? 'يمكن تناوله مرتين يومياً' : 'Can be taken twice daily'}
                    </li>
                  </ul>
                </div>
              </div>

              <div className="pt-8 border-t border-gray-200">
                <h4 className="text-xl font-black mb-4 flex items-center gap-2">
                  <AlertTriangle size={20} className="text-yellow-500" />
                  {language === 'ar' ? 'تحذيرات السلامة' : 'Safety Warnings'}
                </h4>
                <p className="text-gray-600 font-bold">
                  {language === 'ar' 
                    ? 'يُرجى استشارة الطبيب قبل الاستخدام إذا كنت تعاني من أي حالة صحية. احفظ في مكان بارد وجاف بعيداً عن متناول الأطفال.'
                    : 'Please consult your doctor before use if you have any health conditions. Store in a cool, dry place away from children.'}
                </p>
              </div>

              {/* Additional Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-gray-200">
                <div className="flex items-center gap-3">
                  <MapPin size={20} className="text-primary" />
                  <div>
                    <p className="text-xs font-black uppercase text-gray-500">{language === 'ar' ? 'بلد الصنع' : 'Country of Origin'}</p>
                    <p className="text-sm font-bold">{language === 'ar' ? 'الولايات المتحدة' : 'United States'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar size={20} className="text-primary" />
                  <div>
                    <p className="text-xs font-black uppercase text-gray-500">{language === 'ar' ? 'تاريخ الانتهاء' : 'Expiry Date'}</p>
                    <p className="text-sm font-bold">{language === 'ar' ? '2025-12-31' : 'Dec 31, 2025'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Package size={20} className="text-primary" />
                  <div>
                    <p className="text-xs font-black uppercase text-gray-500">{language === 'ar' ? 'وزن العبوة' : 'Package Weight'}</p>
                    <p className="text-sm font-bold">{product.weight || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Nutrition Tab */}
          {activeTab === 'nutrition' && (
            <div className="bg-white p-8 rounded-3xl border border-gray-100">
              <h3 className="text-2xl font-black mb-8">{t('nutritionFacts')}</h3>
              {product.nutrition && product.nutrition.length > 0 ? (
                <div className="max-w-4xl mx-auto">
                  <div className="bg-secondary text-white p-12 rounded-[3rem]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {product.nutrition.map((item, i) => (
                        <div key={i} className="flex items-center justify-between border-b border-white/10 pb-4">
                          <div className="flex-1">
                            <p className="text-xs text-primary font-black uppercase tracking-widest mb-1">
                              {language === 'ar' ? item.labelAr : item.labelEn}
                            </p>
                          </div>
                          <p className="text-2xl font-black italic ml-4">{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 font-bold text-center py-12">
                  {language === 'ar' ? 'لا توجد معلومات غذائية متاحة' : 'No nutrition information available'}
                </p>
              )}
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className="bg-white p-8 rounded-3xl border border-gray-100">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-black mb-2">{t('reviews')}</h3>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={20}
                          className={`${
                            star <= Math.round(product.rating)
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-lg font-black ml-2">{product.rating}</span>
                    <span className="text-gray-500 text-sm font-bold ml-2">
                      ({product.reviewsCount} {language === 'ar' ? 'تقييم' : 'reviews'})
                    </span>
                  </div>
                </div>
                {user && !hasReviewed && (
                  <button 
                    onClick={() => setShowReviewModal(true)}
                    className="px-6 py-3 bg-primary text-white rounded-xl font-black hover:bg-secondary transition-all"
                  >
                    {language === 'ar' ? 'أضف تقييم' : 'Add Review'}
                  </button>
                )}
                {!user && (
                  <button 
                    onClick={() => onNavigate('login')}
                    className="px-6 py-3 bg-primary text-white rounded-xl font-black hover:bg-secondary transition-all"
                  >
                    {language === 'ar' ? 'سجل دخول لإضافة تقييم' : 'Login to Add Review'}
                  </button>
                )}
              </div>

              <div className="space-y-6">
                {reviewsLoading ? (
                  <div className="text-center py-12">
                    <Loader2 className="animate-spin mx-auto mb-4 text-primary" size={48} />
                    <p className="text-gray-500 font-bold">
                      {language === 'ar' ? 'جاري تحميل التقييمات...' : 'Loading reviews...'}
                    </p>
                  </div>
                ) : reviews.length > 0 ? (
                  reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-black text-lg">{review.userName}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  size={16}
                                  className={`${
                                    star <= review.rating
                                      ? 'text-yellow-400 fill-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-gray-500 font-bold">{review.date}</span>
                            {review.isVerifiedPurchase && (
                              <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full font-bold">
                                {language === 'ar' ? 'شراء موثق' : 'Verified Purchase'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-600 font-bold leading-relaxed">{review.comment || ''}</p>
                      <div className="flex items-center gap-4 mt-4">
                        <button 
                          onClick={async () => {
                            if (!user) {
                              onNavigate('login');
                              return;
                            }
                            try {
                              await reviewAPI.markHelpful(review.id);
                              fetchReviews(); // Refresh reviews to update helpful count
                            } catch (error: any) {
                              alert(error.message || (language === 'ar' ? 'حدث خطأ' : 'An error occurred'));
                            }
                          }}
                          className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors"
                        >
                          <ThumbsUp size={16} />
                          <span className="text-xs font-bold">
                            {language === 'ar' ? 'مفيد' : 'Helpful'} ({review.helpfulCount || 0})
                          </span>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <MessageSquare size={48} className="text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-bold">
                      {language === 'ar' ? 'لا توجد مراجعات بعد' : 'No reviews yet'}
                    </p>
                    {user && !hasReviewed && (
                      <button 
                        onClick={() => setShowReviewModal(true)}
                        className="mt-4 px-6 py-3 bg-primary text-white rounded-xl font-black hover:bg-secondary transition-all"
                      >
                        {language === 'ar' ? 'كن أول من يقيّم' : 'Be the first to review'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <div className="mt-32">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-black italic uppercase mb-8 md:mb-12">{t('similarProducts')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {similarProducts.map((product, index) => {
                // Make first product larger on medium+ screens, normal on mobile
                const isLarge = index === 0;
                return (
                  <div 
                    key={product.id} 
                    className={`${isLarge ? 'sm:col-span-2 lg:col-span-2 lg:row-span-2' : ''} flex flex-col`}
                  >
                    {isLarge ? (
                      <div 
                        className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 flex flex-col h-full cursor-pointer relative"
                        onClick={() => onNavigate('product', { id: product.id })}
                      >
                        {/* Heart Icon (Wishlist) */}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWishlist(product.id);
                          }}
                          className={`absolute top-4 left-4 z-10 p-2 rounded-full transition-all duration-300 ${isInWishlist(product.id) ? 'bg-primary text-white scale-110 shadow-lg' : 'bg-white text-gray-400 hover:text-primary hover:bg-accent'}`}
                        >
                          <Heart size={18} fill={isInWishlist(product.id) ? "currentColor" : "none"} />
                        </button>

                        <div className="relative w-full aspect-[4/5] overflow-hidden bg-accent flex items-center justify-center p-4 md:p-6 lg:p-8">
                          <img 
                            src={product.image} 
                            alt={language === 'ar' ? product.nameAr : product.nameEn} 
                            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700 ease-out"
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            onError={(e) => {
                              e.currentTarget.src = "https://images.unsplash.com/photo-1577538928305-3807c3993047?q=80&w=800&auto=format&fit=crop";
                            }}
                          />
                          
                          {product.oldPrice && (
                            <div className="absolute top-4 right-4 bg-primary text-white text-xs font-black px-3 py-1 rounded-full shadow-lg">
                              -{Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%
                            </div>
                          )}
                        </div>

                        <div className="p-4 md:p-6 flex-grow flex flex-col">
                          <div className="flex items-center gap-1 mb-2">
                            <Star className="text-yellow-400 fill-yellow-400" size={14} />
                            <span className="text-xs md:text-sm font-bold text-gray-700">{product.rating}</span>
                            <span className="text-[10px] text-gray-400">({product.reviewsCount} {language === 'ar' ? 'تقييم' : 'reviews'})</span>
                          </div>
                          
                          <h3 className="font-bold text-base md:text-lg lg:text-xl mb-3 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                            {language === 'ar' ? product.nameAr : product.nameEn}
                          </h3>

                          <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-50">
                            <div className="flex flex-col">
                              {(() => {
                                const hasDiscount = customerDiscount && isDiscountActive(customerDiscount);
                                const discountedPrice = calculateDiscountedPrice(product.price, customerDiscount);
                                
                                if (hasDiscount && discountedPrice < product.price) {
                                  return (
                                    <>
                                      <span className="text-primary font-black text-xl md:text-2xl leading-none">
                                        {discountedPrice.toFixed(2)} <span className="text-xs md:text-sm font-normal opacity-70">{language === 'ar' ? 'ج.م' : 'EGP'}</span>
                                      </span>
                                      <span className="text-gray-400 line-through text-xs md:text-sm font-semibold mt-1">
                                        {product.price} {language === 'ar' ? 'ج.م' : 'EGP'}
                                      </span>
                                      <span className="text-green-600 text-[10px] md:text-xs font-bold mt-1">
                                        {language === 'ar' ? `خصم ${customerDiscount?.discount_percentage}%` : `${customerDiscount?.discount_percentage}% OFF`}
                                      </span>
                                    </>
                                  );
                                }
                                return (
                                  <>
                                    <span className="text-primary font-black text-xl md:text-2xl leading-none">
                                      {product.price} <span className="text-xs md:text-sm font-normal opacity-70">{language === 'ar' ? 'ج.م' : 'EGP'}</span>
                                    </span>
                                    {product.oldPrice && (
                                      <span className="text-gray-400 line-through text-xs md:text-sm font-semibold mt-1">
                                        {product.oldPrice} {language === 'ar' ? 'ج.م' : 'EGP'}
                                      </span>
                                    )}
                                  </>
                                );
                              })()}
                            </div>
                            
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                addToCart(product, 1, product.flavor && product.flavor.length > 0 ? product.flavor[0] : '');
                              }}
                              className="w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center transition-all group/btn shadow-md active:scale-90 bg-secondary text-white hover:bg-primary hover:shadow-primary/20"
                              title={t('addToCart')}
                            >
                              <ShoppingCart size={20} className="md:w-6 md:h-6 group-hover/btn:animate-bounce" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <ProductCard
                        product={product}
                        onClick={(id) => onNavigate('product', { id })}
                        onAddToCart={(e, p) => addToCart(p, 1, p.flavor[0])}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Review Modal */}
        {showReviewModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-black">{language === 'ar' ? 'أضف تقييمك' : 'Add Your Review'}</h3>
                <button
                  onClick={() => {
                    setShowReviewModal(false);
                    setReviewForm({ rating: 5, comment: '' });
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XIcon size={24} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Rating */}
                <div>
                  <label className="block text-sm font-black mb-3">
                    {language === 'ar' ? 'التقييم' : 'Rating'} *
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                        className="focus:outline-none"
                      >
                        <Star
                          size={32}
                          className={`transition-colors ${
                            star <= reviewForm.rating
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-sm font-black mb-3">
                    {language === 'ar' ? 'التعليق (اختياري)' : 'Comment (Optional)'}
                  </label>
                  <textarea
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    placeholder={language === 'ar' ? 'اكتب تعليقك هنا...' : 'Write your comment here...'}
                    className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    rows={5}
                    maxLength={1000}
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    {reviewForm.comment.length}/1000
                  </p>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4">
                  <button
                    onClick={async () => {
                      if (!id) return;
                      try {
                        setSubmittingReview(true);
                        await reviewAPI.createReview(id, reviewForm.rating, reviewForm.comment);
                        setShowReviewModal(false);
                        setReviewForm({ rating: 5, comment: '' });
                        setHasReviewed(true);
                        fetchReviews(); // Refresh reviews
                        // Refresh product to update rating
                        const response = await productsAPI.getProductById(id);
                        if (response.success && response.data && response.data.product) {
                          const prod = response.data.product;
                          let imageUrl = prod.image || null;
                          if (imageUrl && !imageUrl.startsWith('http') && imageUrl.startsWith('/')) {
                            imageUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${imageUrl}`;
                          }
                          let imagesArray: string[] = [];
                          if (prod.images && Array.isArray(prod.images) && prod.images.length > 0) {
                            imagesArray = prod.images.map((img: string) => {
                              if (img && !img.startsWith('http') && img.startsWith('/')) {
                                return `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${img}`;
                              }
                              return img;
                            });
                          }
                          setProduct({
                            ...prod,
                            image: imageUrl,
                            images: imagesArray.length > 0 ? imagesArray : (imageUrl ? [imageUrl] : []),
                            rating: parseFloat(prod.rating || 0),
                            reviewsCount: parseInt(prod.reviews_count || 0)
                          });
                        }
                        alert(language === 'ar' ? 'تم إضافة التقييم بنجاح!' : 'Review added successfully!');
                      } catch (error: any) {
                        alert(error.message || (language === 'ar' ? 'حدث خطأ أثناء إضافة التقييم' : 'Error adding review'));
                      } finally {
                        setSubmittingReview(false);
                      }
                    }}
                    disabled={submittingReview}
                    className="flex-1 px-6 py-3 bg-primary text-white rounded-xl font-black hover:bg-secondary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submittingReview ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="animate-spin" size={20} />
                        {language === 'ar' ? 'جاري الإرسال...' : 'Submitting...'}
                      </span>
                    ) : (
                      language === 'ar' ? 'إرسال التقييم' : 'Submit Review'
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowReviewModal(false);
                      setReviewForm({ rating: 5, comment: '' });
                    }}
                    className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-black hover:bg-gray-200 transition-all"
                  >
                    {language === 'ar' ? 'إلغاء' : 'Cancel'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
