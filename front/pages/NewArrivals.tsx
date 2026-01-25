import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { productsAPI } from '../utils/api';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import { Sparkles, Clock, TrendingUp, Loader2 } from 'lucide-react';
import { Product } from '../types';

interface NewArrivalsProps {
  onNavigate: (page: string, params?: any) => void;
}

const NewArrivals: React.FC<NewArrivalsProps> = ({ onNavigate }) => {
  const { t, language } = useLanguage();
  const { addToCart } = useCart();
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [latest, setLatest] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all active products
        const response = await productsAPI.getAllProducts({});
        
        if (response.success && response.data && response.data.products) {
          // Format products and ensure image URLs are full URLs
          const formattedProducts = response.data.products.map((product: any) => {
            let imageUrl = product.image || null;
            if (imageUrl && !imageUrl.startsWith('http') && imageUrl.startsWith('/')) {
              imageUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${imageUrl}`;
            }
            return {
              ...product,
              image: imageUrl || ''
            };
          });

          // Sort by created_at (newest first) - products added in last 30 days or top 8 newest
          const sortedByDate = [...formattedProducts]
            .sort((a, b) => {
              const dateA = new Date(a.created_at || 0).getTime();
              const dateB = new Date(b.created_at || 0).getTime();
              return dateB - dateA;
            });

          // Latest additions (most recent 4)
          const latestProducts = sortedByDate.slice(0, 4);
          setLatest(latestProducts);

          // New arrivals (top 8 newest)
          const newProducts = sortedByDate.slice(0, 8);
          setNewArrivals(newProducts);
        } else {
          setError(language === 'ar' ? 'فشل تحميل المنتجات' : 'Failed to load products');
        }
      } catch (err) {
        console.error('Error fetching new arrivals:', err);
        setError(err instanceof Error ? err.message : (language === 'ar' ? 'حدث خطأ أثناء تحميل المنتجات' : 'An error occurred while loading products'));
      } finally {
        setLoading(false);
      }
    };

    fetchNewArrivals();
  }, [language]);

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    addToCart(product, 1, product.flavor && product.flavor.length > 0 ? product.flavor[0] : '');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex justify-center items-center py-32">
          <div className="text-center">
            <Loader2 className="animate-spin h-16 w-16 text-primary mx-auto mb-4" />
            <p className="text-gray-500 font-bold">
              {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex justify-center items-center py-32">
          <div className="text-center">
            <p className="text-red-500 font-bold mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-secondary transition-all"
            >
              {language === 'ar' ? 'إعادة المحاولة' : 'Retry'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Header Section */}
      <div className="text-center mb-16 space-y-6">
        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 px-6 py-2 rounded-full text-primary text-sm font-black uppercase tracking-[0.2em]">
          <Sparkles size={18} fill="currentColor" /> {language === 'ar' ? 'جديد' : 'NEW'}
        </div>
        <h1 className="text-5xl lg:text-7xl font-black italic uppercase tracking-tighter">
          {language === 'ar' ? 'المنتجات الجديدة' : 'New Arrivals'}
        </h1>
        <p className="text-gray-500 font-bold text-lg max-w-2xl mx-auto">
          {language === 'ar' 
            ? 'اكتشف أحدث المنتجات اللي وصلتنا حديثاً. كن أول من يجربها!'
            : 'Discover our latest products that just arrived. Be the first to try them!'}
        </p>
        <div className="w-32 h-2 bg-primary mx-auto rounded-full"></div>
      </div>

      {/* Latest Additions Section */}
      <section className="mb-24">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-2xl">
              <Clock className="text-primary" size={28} />
            </div>
            <div>
              <h2 className="text-3xl lg:text-4xl font-black italic uppercase">
                {language === 'ar' ? 'وصل حديثاً' : 'Just Arrived'}
              </h2>
              <p className="text-gray-400 text-sm font-bold">
                {language === 'ar' ? 'أحدث المنتجات اللي وصلتنا' : 'The most recent products we received'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {latest.map((product) => (
            <div key={product.id} className="relative">
              <div className="absolute -top-3 -right-3 z-10 bg-primary text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg animate-pulse">
                {language === 'ar' ? 'جديد' : 'NEW'}
              </div>
              <ProductCard 
                product={product} 
                onClick={(id) => onNavigate('product', { id })}
                onAddToCart={handleAddToCart}
              />
            </div>
          ))}
        </div>
      </section>

      {/* New Arrivals Section */}
      <section>
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-2xl">
              <TrendingUp className="text-primary" size={28} />
            </div>
            <div>
              <h2 className="text-3xl lg:text-4xl font-black italic uppercase">
                {language === 'ar' ? 'منتجات جديدة' : 'New Products'}
              </h2>
              <p className="text-gray-400 text-sm font-bold">
                {language === 'ar' ? 'مجموعة من المنتجات الجديدة المميزة' : 'A collection of new featured products'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {newArrivals.map((product) => (
            <div key={product.id} className="relative">
              <div className="absolute -top-3 -right-3 z-10 bg-primary text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg">
                {language === 'ar' ? 'جديد' : 'NEW'}
              </div>
              <ProductCard 
                product={product} 
                onClick={(id) => onNavigate('product', { id })}
                onAddToCart={handleAddToCart}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Info Banner */}
      <div className="mt-24 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-[3rem] p-12 lg:p-16 text-center">
        <div className="max-w-3xl mx-auto space-y-4">
          <Sparkles className="text-primary mx-auto" size={48} />
          <h3 className="text-3xl lg:text-4xl font-black italic uppercase text-secondary">
            {language === 'ar' ? 'كن أول من يجرب الجديد!' : 'Be the First to Try the New!'}
          </h3>
          <p className="text-gray-600 font-bold text-lg">
            {language === 'ar' 
              ? 'اشترك في قائمتنا البريدية وكن أول من يعرف عن المنتجات الجديدة والعروض الحصرية'
              : 'Subscribe to our newsletter and be the first to know about new products and exclusive offers'}
          </p>
          <button 
            onClick={() => onNavigate('shop')}
            className="bg-primary hover:bg-secondary text-white font-black px-10 py-4 rounded-full uppercase italic hover:scale-105 transition-all transform shadow-xl mt-6"
          >
            {language === 'ar' ? 'تسوق المنتجات الجديدة' : 'Shop New Products'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewArrivals;

