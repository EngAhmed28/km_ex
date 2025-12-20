
import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { Search, ShoppingCart, User, Menu, X, Globe, LogOut, Heart } from 'lucide-react';

interface HeaderProps {
  onNavigate: (page: string, params?: any) => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
  const { language, setLanguage, t } = useLanguage();
  const { user, logout, isAuthenticated } = useAuth();
  const { totalItems } = useCart();
  const { wishlist } = useWishlist();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleLang = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate('shop', { search: searchQuery });
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Mobile Menu Button */}
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden text-secondary p-2 hover:bg-accent rounded-xl"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            
            <div 
              className="flex items-center gap-2 cursor-pointer group" 
              onClick={() => onNavigate('home')}
            >
              <div className="bg-primary text-white p-2 rounded-xl font-black text-2xl group-hover:rotate-12 transition-transform">K</div>
              <div className="hidden sm:block">
                <p className="font-extrabold text-xl leading-none">KING OF</p>
                <p className="font-extrabold text-xl leading-none text-primary">MUSCLES</p>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8 font-bold text-sm tracking-tight">
            <button onClick={() => onNavigate('home')} className="hover:text-primary transition-colors uppercase italic">{t('home')}</button>
            <button onClick={() => onNavigate('shop')} className="hover:text-primary transition-colors uppercase italic">{t('shop')}</button>
            <button onClick={() => onNavigate('categories')} className="hover:text-primary transition-colors uppercase italic">{t('categories')}</button>
            <button onClick={() => onNavigate('bestsellers')} className="hover:text-primary transition-colors uppercase italic">{t('bestSellers')}</button>
            <button onClick={() => onNavigate('newarrivals')} className="hover:text-primary transition-colors uppercase italic">{t('newArrivals')}</button>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-3">
            {/* Search */}
            <form onSubmit={handleSearch} className="hidden md:flex relative group">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('search')} 
                className="bg-accent px-5 py-2.5 pr-12 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 w-40 xl:w-56 transition-all"
              />
              <button type="submit" className={`absolute ${language === 'ar' ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary`}>
                <Search size={16} />
              </button>
            </form>

            <button onClick={toggleLang} className="p-2.5 hover:bg-accent rounded-2xl text-gray-600 flex items-center gap-2 transition-all" title="Change Language">
              <Globe size={20} />
              <span className="text-[10px] font-black uppercase hidden sm:inline">{language === 'ar' ? 'English' : 'العربية'}</span>
            </button>

            <div className="h-8 w-px bg-gray-100 mx-1 hidden sm:block"></div>

            <div className="flex items-center gap-1">
              <button 
                onClick={() => onNavigate('shop', { wishlist: true })}
                className="p-2.5 hover:bg-accent rounded-2xl relative text-secondary transition-all"
                title="المفضلة"
              >
                <Heart size={20} className={wishlist.length > 0 ? 'text-primary fill-primary' : ''} />
                {wishlist.length > 0 && (
                  <span className="absolute top-1 right-1 bg-primary text-white text-[8px] font-black w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">
                    {wishlist.length}
                  </span>
                )}
              </button>

              {isAuthenticated ? (
                <div className="flex items-center gap-1">
                  <button className="hidden sm:flex items-center gap-2 p-1.5 pr-4 hover:bg-accent rounded-2xl transition-all" title="حسابي">
                    <span className="text-xs font-black text-gray-700">{user?.name}</span>
                    <div className="w-8 h-8 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-black">
                      {user?.name.charAt(0)}
                    </div>
                  </button>
                  <button onClick={logout} className="p-2.5 hover:bg-accent rounded-2xl text-gray-400 hover:text-primary transition-all" title={t('logout')}>
                    <LogOut size={20} />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => onNavigate('login')}
                  className="p-2.5 hover:bg-accent rounded-2xl text-secondary transition-all"
                  title={t('login')}
                >
                  <User size={20} />
                </button>
              )}

              <button 
                className="p-2.5 hover:bg-accent rounded-2xl relative text-secondary transition-all"
                onClick={() => onNavigate('cart')}
                title={t('cart')}
              >
                <ShoppingCart size={20} />
                {totalItems > 0 && (
                  <span className="absolute top-1 right-1 bg-primary text-white text-[8px] font-black w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 p-6 absolute top-full left-0 w-full shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
          <form onSubmit={handleSearch} className="mb-8">
            <div className="relative">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('search')} 
                className="bg-accent w-full px-6 py-4 rounded-2xl text-sm font-bold outline-none"
              />
              <button type="submit" className={`absolute ${language === 'ar' ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-primary`}>
                <Search size={20} />
              </button>
            </div>
          </form>
          <div className="flex flex-col gap-6 font-black text-xl italic uppercase">
            <button onClick={() => { onNavigate('home'); setIsMenuOpen(false); }} className="text-right border-b pb-4 border-accent hover:text-primary transition-colors">{t('home')}</button>
            <button onClick={() => { onNavigate('shop'); setIsMenuOpen(false); }} className="text-right border-b pb-4 border-accent hover:text-primary transition-colors">{t('shop')}</button>
            <button onClick={() => { onNavigate('categories'); setIsMenuOpen(false); }} className="text-right border-b pb-4 border-accent hover:text-primary transition-colors">{t('categories')}</button>
            <button onClick={() => { onNavigate('bestsellers'); setIsMenuOpen(false); }} className="text-right border-b pb-4 border-accent hover:text-primary transition-colors">{t('bestSellers')}</button>
            <button onClick={() => { onNavigate('newarrivals'); setIsMenuOpen(false); }} className="text-right border-b pb-4 border-accent hover:text-primary transition-colors">{t('newArrivals')}</button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
