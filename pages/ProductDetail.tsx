
import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { products } from '../data/mockData';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
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
  ChevronLeft,
  ChevronRight,
  Loader2,
  X as XIcon
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
  const product = products.find(p => p.id === id) || products[0];
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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
    setIsAdding(true);
    setTimeout(() => {
      addToCart(product, quantity, '');
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

  const similar = products.filter(p => p.category === product.category && p.id !== product.id);
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
            <div className="bg-accent rounded-[4rem] p-12 aspect-square flex items-center justify-center relative group overflow-hidden border border-gray-100 shadow-sm">
              <img src={product.image} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700 ease-out" alt={product.nameEn} />
              
              <div className="absolute top-8 left-8 flex flex-col gap-3">
                <button 
                  onClick={() => toggleWishlist(product.id)}
                  className={`p-4 bg-white/90 backdrop-blur-md rounded-[1.5rem] shadow-xl transition-all ${isLiked ? 'text-primary scale-110' : 'text-gray-400 hover:text-primary hover:scale-110'}`} 
                >
                  <Heart size={22} fill={isLiked ? "currentColor" : "none"} />
                </button>
              </div>

              {product.oldPrice && (
                <div className="absolute top-8 right-8 bg-primary text-white text-xs font-black px-4 py-2 rounded-2xl shadow-xl italic uppercase">
                  {t('bigOffer')}
                </div>
              )}
            </div>
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
                <span className="text-6xl font-black text-primary italic">
                  {product.price} <span className="text-2xl font-normal not-italic opacity-60">{language === 'ar' ? 'ج.م' : 'EGP'}</span>
                </span>
                {product.oldPrice && (
                  <span className="text-2xl text-gray-400 line-through font-bold mt-2">
                    {product.oldPrice} {language === 'ar' ? 'ج.م' : 'EGP'}
                  </span>
                )}
              </div>
            </div>

            <p className="text-gray-500 leading-relaxed font-bold text-lg max-w-xl">
              {language === 'ar' ? product.descriptionAr : product.descriptionEn}
            </p>

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

        {/* Nutritional Facts */}
        <div className="mt-32">
          <h2 className="text-4xl font-black italic uppercase mb-16">{t('nutritionFacts')}</h2>
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 bg-secondary text-white p-12 lg:p-20 rounded-[5rem]">
            <div className="space-y-8 relative z-10">
              {product.nutrition.map((item, i) => (
                <div key={i} className="flex items-center justify-between border-b border-white/5 pb-6">
                  <div>
                    <p className="text-[10px] text-primary font-black uppercase tracking-widest mb-1">{language === 'ar' ? item.labelAr : item.labelEn}</p>
                    <p className="text-3xl font-black italic tracking-tighter">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
