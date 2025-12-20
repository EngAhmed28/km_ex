
import React, { useState } from 'react';
import { Product } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useWishlist } from '../context/WishlistContext';
import { ShoppingCart, Star, Heart, Loader2 } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onClick: (id: string) => void;
  onAddToCart: (e: React.MouseEvent, p: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick, onAddToCart }) => {
  const { language, t } = useLanguage();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAdding(true);
    // Simulate API delay
    setTimeout(() => {
      onAddToCart(e, product);
      setIsAdding(false);
    }, 600);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const isLiked = isInWishlist(product.id);

  return (
    <div 
      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 flex flex-col h-full cursor-pointer relative"
      onClick={() => onClick(product.id)}
    >
      {/* Heart Icon (Wishlist) */}
      <button 
        onClick={handleWishlist}
        className={`absolute top-4 left-4 z-10 p-2 rounded-full transition-all duration-300 ${isLiked ? 'bg-primary text-white scale-110 shadow-lg' : 'bg-white text-gray-400 hover:text-primary hover:bg-accent'}`}
        title={isLiked ? "إزالة من المفضلة" : "إضافة للمفضلة"}
      >
        <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
      </button>

      <div className="relative aspect-[4/5] overflow-hidden bg-accent flex items-center justify-center p-4">
        <img 
          src={product.image} 
          alt={language === 'ar' ? product.nameAr : product.nameEn} 
          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700 ease-out"
          onError={(e) => {
            e.currentTarget.src = "https://images.unsplash.com/photo-1577538928305-3807c3993047?q=80&w=800&auto=format&fit=crop";
          }}
        />
        
        {product.oldPrice && (
          <div className="absolute top-4 right-4 bg-primary text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg">
            -{Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%
          </div>
        )}

        {/* Quick View Overlay Simulation on Hover */}
        <div className="absolute inset-0 bg-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
          <span className="bg-white text-secondary text-xs font-bold py-2 px-4 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">
            عرض التفاصيل
          </span>
        </div>
      </div>

      <div className="p-5 flex-grow flex flex-col">
        <div className="flex items-center gap-1 mb-2">
          <Star className="text-yellow-400 fill-yellow-400" size={14} />
          <span className="text-xs font-bold text-gray-700">{product.rating}</span>
          <span className="text-[10px] text-gray-400">({product.reviewsCount} تقييم)</span>
        </div>
        
        <h3 className="font-bold text-sm md:text-base mb-3 group-hover:text-primary transition-colors line-clamp-2 leading-snug h-10 md:h-12">
          {language === 'ar' ? product.nameAr : product.nameEn}
        </h3>

        <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-50">
          <div className="flex flex-col">
            <span className="text-primary font-black text-xl leading-none">
              {product.price} <span className="text-xs font-normal opacity-70">{language === 'ar' ? 'ج.م' : 'EGP'}</span>
            </span>
            {product.oldPrice && (
              <span className="text-gray-400 line-through text-xs font-semibold mt-1">
                {product.oldPrice} {language === 'ar' ? 'ج.م' : 'EGP'}
              </span>
            )}
          </div>
          
          <button 
            onClick={handleAdd}
            disabled={isAdding}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all group/btn shadow-md active:scale-90 ${isAdding ? 'bg-gray-100 text-gray-400' : 'bg-secondary text-white hover:bg-primary hover:shadow-primary/20'}`}
            title={t('addToCart')}
          >
            {isAdding ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <ShoppingCart size={22} className="group-hover/btn:animate-bounce" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
