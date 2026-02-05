import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { productsAPI } from '../utils/api';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import { ArrowLeft, ArrowRight, Loader2, TrendingUp } from 'lucide-react';

interface BestSellingProps {
  onNavigate: (page: string, params?: any) => void;
}

const BestSelling: React.FC<BestSellingProps> = ({ onNavigate }) => {
  const { t, language } = useLanguage();
  const { addToCart } = useCart();
  
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch best selling products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await productsAPI.getAllProducts({ limit: 100 });
        
        if (response.success && response.data && response.data.products) {
          // Format products
          const formattedProducts = response.data.products.map((product: any) => {
            let imageUrl = product.image || null;
            if (imageUrl && !imageUrl.startsWith('http') && imageUrl.startsWith('/')) {
              imageUrl = `${import.meta.env.VITE_API_URL || 'https://kingofmuscles.metacodecx.com'}${imageUrl}`;
            }
            return {
              ...product,
              nameAr: product.name_ar || product.name,
              nameEn: product.name_en || product.name,
              descriptionAr: product.description_ar || product.description,
              descriptionEn: product.description_en || product.description,
              image: imageUrl,
              rating: product.average_rating || product.rating || 0,
              reviewsCount: product.reviews_count || product.reviewsCount || 0,
              sales_count: product.sales_count || 0,
              oldPrice: product.old_price || null,
              weight: product.weight || '',
              flavor: product.flavors ? product.flavors.split(',') : [],
              stock: product.stock || 0
            };
          });
          
          // Sort by sales_count descending
          const sortedProducts = formattedProducts.sort((a: any, b: any) => 
            (b.sales_count || 0) - (a.sales_count || 0)
          );
          
          setProducts(sortedProducts);
        } else {
          setError(language === 'ar' ? 'فشل تحميل المنتجات' : 'Failed to load products');
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err instanceof Error ? err.message : (language === 'ar' ? 'حدث خطأ أثناء تحميل المنتجات' : 'An error occurred'));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProducts();
  }, [language]);

  const handleAddToCart = (e: React.MouseEvent, product: any) => {
    e.stopPropagation();
    addToCart(product, 1, product.flavor && product.flavor.length > 0 ? product.flavor[0] : '');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
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
      <div className="container mx-auto px-4 py-12">
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
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-primary/10 p-3 rounded-2xl">
            <TrendingUp className="text-primary" size={28} />
          </div>
          <h1 className="text-4xl lg:text-5xl font-black italic uppercase tracking-tighter">
            {language === 'ar' ? 'المنتجات الأكثر مبيعاً' : 'Best Selling Products'}
          </h1>
        </div>
        <p className="text-gray-500 text-lg max-w-2xl">
          {language === 'ar' 
            ? 'اكتشف المنتجات الأكثر شعبية بين عملائنا. هذه المنتجات اختارها الآلاف وحققت نتائج مذهلة.'
            : 'Discover our most popular products. These products have been chosen by thousands and delivered amazing results.'}
        </p>
      </div>

      {/* Products Grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map((product, index) => (
            <div key={product.id} className="relative">
              {/* Rank Badge */}
              {index < 3 && (
                <div className={`absolute -top-3 ${language === 'ar' ? 'right-3' : 'left-3'} z-10`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg shadow-lg ${
                    index === 0 ? 'bg-yellow-400 text-yellow-900' :
                    index === 1 ? 'bg-gray-300 text-gray-700' :
                    'bg-amber-600 text-white'
                  }`}>
                    #{index + 1}
                  </div>
                </div>
              )}
              <ProductCard 
                product={product} 
                onClick={(id) => onNavigate('product', { id })}
                onAddToCart={(e, p) => handleAddToCart(e, p)}
              />
              {/* Sales Count */}
              <div className="mt-2 text-center">
                <span className="text-xs font-bold text-gray-400">
                  {product.sales_count || 0} {language === 'ar' ? 'مبيعة' : 'sold'}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-32 bg-accent/20 rounded-[3rem] border-2 border-dashed border-accent">
          <h3 className="text-2xl font-black italic uppercase mb-2">
            {language === 'ar' ? 'لا توجد منتجات' : 'No products'}
          </h3>
          <p className="text-gray-500">
            {language === 'ar' ? 'لم يتم بيع أي منتجات بعد' : 'No products have been sold yet'}
          </p>
        </div>
      )}

      {/* Back Button */}
      <div className="mt-12 flex justify-center">
        <button
          onClick={() => onNavigate('home')}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-black px-8 py-4 rounded-2xl transition-all flex items-center gap-3"
        >
          {language === 'ar' ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
          {language === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
        </button>
      </div>
    </div>
  );
};

export default BestSelling;
