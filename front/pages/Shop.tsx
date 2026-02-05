
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { productsAPI, categoriesAPI } from '../utils/api';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { Filter, SlidersHorizontal, ChevronDown, Search, X, Loader2 } from 'lucide-react';
import { Product, Category } from '../types';

interface ShopProps {
  onNavigate: (page: string, params?: any) => void;
  initialParams?: any;
}

const Shop: React.FC<ShopProps> = ({ onNavigate, initialParams }) => {
  const { t, language } = useLanguage();
  const { addToCart } = useCart();
  const { wishlist } = useWishlist();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCat, setSelectedCat] = useState(initialParams?.category || 'all');
  const [priceRange, setPriceRange] = useState(10000); // Increased default to show all products
  const [maxPrice, setMaxPrice] = useState(10000); // Track max price for slider
  const [searchQuery, setSearchQuery] = useState(initialParams?.search || '');
  const [showOnlyWishlist, setShowOnlyWishlist] = useState(initialParams?.wishlist || false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoriesAPI.getAllCategories();
        if (response.success && response.data && response.data.categories) {
          const formattedCategories = response.data.categories.map((cat: any) => ({
            id: cat.id.toString(),
            nameAr: cat.name || '',
            nameEn: cat.name_en || cat.name || '',
            image: cat.image_url || '',
            slug: cat.slug || `category-${cat.id}`
          }));
          setCategories(formattedCategories);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const params: any = {};
        if (selectedCat !== 'all') {
          params.category = selectedCat;
        }
        if (searchQuery) {
          params.search = searchQuery;
        }
        // Don't filter by price initially - show all products
        // Price filtering will be done on frontend
        
        const response = await productsAPI.getAllProducts(params);
        
        if (response.success && response.data && response.data.products) {
          // Format products and ensure image URLs are full URLs
          const formattedProducts = response.data.products.map((product: any) => {
            let imageUrl = product.image || null;
            // Convert relative path to full URL if needed
            if (imageUrl && !imageUrl.startsWith('http') && imageUrl.startsWith('/')) {
              imageUrl = `${import.meta.env.VITE_API_URL || 'https://kingofmuscles.metacodecx.com'}${imageUrl}`;
            }
            return {
              ...product,  // Preserve all fields from API (like ProductDetail)
              nameAr: product.name_ar || product.name,
              nameEn: product.name_en || product.name,
              descriptionAr: product.description_ar || product.description,
              descriptionEn: product.description_en || product.description,
              image: imageUrl,
              rating: product.average_rating || product.rating || 0,
              reviewsCount: product.reviews_count || product.reviewsCount || 0,
              oldPrice: product.old_price || null,
              weight: product.weight || '',
              flavor: product.flavors ? product.flavors.split(',') : [],
              stock: product.stock || 0
            };
          });
          setProducts(formattedProducts);
          
          // Update max price for slider based on actual product prices
          if (formattedProducts.length > 0) {
            const maxProductPrice = Math.max(...formattedProducts.map((p: Product) => p.price || 0));
            const roundedMax = Math.ceil(maxProductPrice / 100) * 100; // Round up to nearest 100
            setMaxPrice(Math.max(10000, roundedMax + 1000)); // At least 10000, or rounded max + buffer
            // Update priceRange if it's too low
            if (priceRange < maxProductPrice) {
              setPriceRange(Math.max(10000, roundedMax + 1000));
            }
          }
        } else {
          setError(language === 'ar' ? 'فشل تحميل المنتجات' : 'Failed to load products');
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err instanceof Error ? err.message : (language === 'ar' ? 'حدث خطأ أثناء تحميل المنتجات' : 'An error occurred while loading products'));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProducts();
  }, [selectedCat, searchQuery, language]); // Removed priceRange - filtering is done on frontend

  useEffect(() => {
    if (initialParams?.category) setSelectedCat(initialParams.category);
    if (initialParams?.search) setSearchQuery(initialParams.search);
    if (initialParams?.wishlist) setShowOnlyWishlist(true);
  }, [initialParams]);

  const filteredProducts = products.filter(p => {
    const priceMatch = p.price <= priceRange;
    const wishlistMatch = !showOnlyWishlist || wishlist.includes(p.id);
    
    return priceMatch && wishlistMatch;
  });

  const clearFilters = () => {
    setSelectedCat('all');
    setPriceRange(maxPrice);
    setSearchQuery('');
    setShowOnlyWishlist(false);
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
      <div className="flex flex-col lg:flex-row gap-8">
        
        <aside className="w-full lg:w-1/4 space-y-8">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm sticky top-24">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2 text-secondary">
                <Filter size={20} className="text-primary" />
                <h3 className="font-black text-lg uppercase italic">{t('filterBy')}</h3>
              </div>
              {(selectedCat !== 'all' || searchQuery || showOnlyWishlist) && (
                <button onClick={clearFilters} className="text-[10px] font-black text-primary uppercase hover:underline">{t('clearAll')}</button>
              )}
            </div>

            <div className="mb-8">
              <button 
                onClick={() => setShowOnlyWishlist(!showOnlyWishlist)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${showOnlyWishlist ? 'border-primary bg-primary/5' : 'border-accent bg-accent/20'}`}
              >
                <span className="font-bold text-sm">{t('wishlistOnly')}</span>
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${showOnlyWishlist ? 'bg-primary border-primary' : 'bg-white border-gray-300'}`}>
                  {showOnlyWishlist && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                </div>
              </button>
            </div>

            <div className="mb-8">
              <h4 className="font-black text-[10px] mb-4 uppercase tracking-[0.2em] text-gray-400">{t('customSearch')}</h4>
              <div className="relative">
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('searchHere')}
                  className="w-full bg-accent px-4 py-3 rounded-xl text-sm font-bold outline-none border-2 border-transparent focus:border-primary/20"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className={`absolute ${language === 'ar' ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-gray-400`}>
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            <div className="mb-8">
              <h4 className="font-black text-[10px] mb-4 uppercase tracking-[0.2em] text-gray-400">{t('categories')}</h4>
              <div className="grid grid-cols-1 gap-2">
                <button 
                  onClick={() => setSelectedCat('all')}
                  className={`text-right px-4 py-3 rounded-2xl text-sm font-bold transition-all border-2 ${selectedCat === 'all' ? 'border-primary bg-primary text-white' : 'border-transparent bg-accent/30 hover:bg-accent hover:border-accent'}`}
                >
                  {t('all')}
                </button>
                {categories.map(cat => (
                  <button 
                    key={cat.id}
                    onClick={() => setSelectedCat(cat.slug)}
                    className={`text-right px-4 py-3 rounded-2xl text-sm font-bold transition-all border-2 ${selectedCat === cat.slug ? 'border-primary bg-primary text-white' : 'border-transparent bg-accent/30 hover:bg-accent hover:border-accent'}`}
                  >
                    {language === 'ar' ? cat.nameAr : cat.nameEn}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-gray-400">{t('price')}</h4>
                <span className="text-xs font-black text-primary">{priceRange} {language === 'ar' ? 'ج.م' : 'EGP'}</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max={maxPrice} 
                step="50"
                value={priceRange} 
                onChange={(e) => setPriceRange(parseInt(e.target.value))}
                className="w-full h-1.5 bg-accent rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
          </div>
        </aside>

        <main className="flex-grow">
          <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-5 rounded-3xl border border-gray-100 shadow-sm mb-8 gap-4">
            <div className="flex items-center gap-3">
              <p className="text-sm font-bold text-gray-400">
                {language === 'ar' ? 'عرض' : 'Showing'} <span className="text-secondary font-black">{filteredProducts.length}</span> {language === 'ar' ? 'منتج' : 'products'}
              </p>
            </div>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onClick={(id) => onNavigate('product', { id })}
                  onAddToCart={(e, p) => addToCart(p, 1, p.flavor[0])}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-32 bg-accent/20 rounded-[3rem] border-2 border-dashed border-accent">
              <h3 className="text-2xl font-black italic uppercase mb-2">{t('noResults')}</h3>
              <button onClick={clearFilters} className="bg-primary text-white px-8 py-3 rounded-xl font-black uppercase text-xs">{t('resetFilters')}</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Shop;
