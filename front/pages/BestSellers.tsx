import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { products } from '../data/mockData';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import { Trophy, Star, TrendingUp } from 'lucide-react';

interface BestSellersProps {
  onNavigate: (page: string, params?: any) => void;
}

const BestSellers: React.FC<BestSellersProps> = ({ onNavigate }) => {
  const { t, language } = useLanguage();
  const { addToCart } = useCart();

  // Sort products by rating and reviews count (best sellers)
  const bestSellers = [...products]
    .sort((a, b) => {
      // Sort by rating first, then by reviews count
      if (b.rating !== a.rating) return b.rating - a.rating;
      return b.reviewsCount - a.reviewsCount;
    })
    .slice(0, 8); // Top 8 products

  // Recommended products (high rating with good reviews)
  const recommended = [...products]
    .filter(p => p.rating >= 4.5 && p.reviewsCount >= 50)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 8);

  const handleAddToCart = (e: React.MouseEvent, product: any) => {
    e.stopPropagation();
    addToCart(product, 1, '');
  };

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Header Section */}
      <div className="text-center mb-16 space-y-6">
        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 px-6 py-2 rounded-full text-primary text-sm font-black uppercase tracking-[0.2em]">
          <Trophy size={18} fill="currentColor" /> {language === 'ar' ? 'الأكثر مبيعاً' : 'BEST SELLERS'}
        </div>
        <h1 className="text-5xl lg:text-7xl font-black italic uppercase tracking-tighter">
          {language === 'ar' ? 'الأكثر مبيعاً' : 'Best Sellers'}
        </h1>
        <p className="text-gray-500 font-bold text-lg max-w-2xl mx-auto">
          {language === 'ar' 
            ? 'اكتشف أفضل المنتجات الأكثر طلباً من عملائنا بناءً على التقييمات والمبيعات'
            : 'Discover our top-rated products based on customer reviews and sales'}
        </p>
        <div className="w-32 h-2 bg-primary mx-auto rounded-full"></div>
      </div>

      {/* Best Sellers Section */}
      <section className="mb-24">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-2xl">
              <TrendingUp className="text-primary" size={28} />
            </div>
            <div>
              <h2 className="text-3xl lg:text-4xl font-black italic uppercase">
                {language === 'ar' ? 'الأكثر مبيعاً' : 'Top Sellers'}
              </h2>
              <p className="text-gray-400 text-sm font-bold">
                {language === 'ar' ? 'بناءً على المبيعات والتقييمات' : 'Based on sales and ratings'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {bestSellers.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onClick={(id) => onNavigate('product', { id })}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      </section>

      {/* Recommended Section */}
      <section>
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-2xl">
              <Star className="text-primary fill-primary" size={28} />
            </div>
            <div>
              <h2 className="text-3xl lg:text-4xl font-black italic uppercase">
                {language === 'ar' ? 'الموصى به' : 'Recommended'}
              </h2>
              <p className="text-gray-400 text-sm font-bold">
                {language === 'ar' ? 'منتجات عالية التقييم موصى بها بشدة' : 'Highly rated products we highly recommend'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {recommended.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onClick={(id) => onNavigate('product', { id })}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      </section>

      {/* Stats Banner */}
      <div className="mt-24 bg-secondary text-white rounded-[4rem] p-12 lg:p-20 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center border border-white/10">
        {[
          { label: language === 'ar' ? 'منتج موصى به' : 'Recommended', value: '100%', icon: <Star className="text-primary mx-auto mb-4" size={32} fill="currentColor" /> },
          { label: language === 'ar' ? 'تقييم عالي' : 'High Rating', value: '4.8+', icon: <Trophy className="text-primary mx-auto mb-4" size={32} /> },
          { label: language === 'ar' ? 'مراجعات' : 'Reviews', value: '50+', icon: <TrendingUp className="text-primary mx-auto mb-4" size={32} /> },
          { label: language === 'ar' ? 'رضا العملاء' : 'Satisfaction', value: '98%', icon: <Star className="text-primary mx-auto mb-4" size={32} fill="currentColor" /> },
        ].map((stat, i) => (
          <div key={i} className="space-y-2 group">
            <div className="transform group-hover:scale-110 transition-transform duration-300">{stat.icon}</div>
            <h3 className="text-4xl lg:text-5xl font-black italic text-primary">{stat.value}</h3>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BestSellers;

