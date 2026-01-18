
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { products, categories } from '../data/mockData';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { Filter, SlidersHorizontal, ChevronDown, Search, X, Loader2 } from 'lucide-react';

interface ShopProps {
  onNavigate: (page: string, params?: any) => void;
  initialParams?: any;
}

const Shop: React.FC<ShopProps> = ({ onNavigate, initialParams }) => {
  const { t, language } = useLanguage();
  const { addToCart } = useCart();
  const { wishlist } = useWishlist();
  
  const [selectedCat, setSelectedCat] = useState(initialParams?.category || 'all');
  const [priceRange, setPriceRange] = useState(500);
  const [searchQuery, setSearchQuery] = useState(initialParams?.search || '');
  const [showOnlyWishlist, setShowOnlyWishlist] = useState(initialParams?.wishlist || false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialParams?.category) setSelectedCat(initialParams.category);
    if (initialParams?.search) setSearchQuery(initialParams.search);
    if (initialParams?.wishlist) setShowOnlyWishlist(true);
  }, [initialParams]);

  const filteredProducts = products.filter(p => {
    const catMatch = selectedCat === 'all' || p.category === selectedCat;
    const priceMatch = p.price <= priceRange;
    const searchMatch = !searchQuery || 
      p.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.nameEn.toLowerCase().includes(searchQuery.toLowerCase());
    const wishlistMatch = !showOnlyWishlist || wishlist.includes(p.id);
    
    return catMatch && priceMatch && searchMatch && wishlistMatch;
  });

  const clearFilters = () => {
    setSelectedCat('all');
    setPriceRange(500);
    setSearchQuery('');
    setShowOnlyWishlist(false);
  };

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
                <span className="text-xs font-black text-primary">{priceRange} {language === 'ar' ? 'ر.س' : 'SAR'}</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="1000" 
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
