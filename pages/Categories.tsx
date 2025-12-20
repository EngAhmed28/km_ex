
import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { categories } from '../data/mockData';
import { ChevronRight } from 'lucide-react';

interface CategoriesProps {
  onNavigate: (page: string, params?: any) => void;
}

const Categories: React.FC<CategoriesProps> = ({ onNavigate }) => {
  const { t, language } = useLanguage();

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-16 space-y-4">
        <h1 className="text-4xl lg:text-5xl font-black italic uppercase text-secondary">
          {language === 'ar' ? 'اختر طلبك حسب القسم' : 'Choose Your Order by Category'}
        </h1>
        <p className="text-gray-400 font-bold text-lg">
          {language === 'ar' ? 'منتجات متكاملة لجميع متطلباتك' : 'Integrated products for all your requirements'}
        </p>
        <div className="w-24 h-1.5 bg-primary mx-auto rounded-full mt-6"></div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-10">
        {categories.map((cat) => (
          <div 
            key={cat.id}
            onClick={() => onNavigate('shop', { category: cat.slug })}
            className="group relative cursor-pointer bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 flex flex-col"
          >
            {/* Image as Full Background - Bright and Clear */}
            <div 
              className="aspect-[4/5] relative overflow-hidden bg-secondary"
              style={{
                backgroundImage: `url(${cat.image})`,
                backgroundSize: '75%',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                filter: 'brightness(1.1) contrast(1.05)'
              }}
            >
              {/* Light Overlay - Minimal Darkening */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent group-hover:from-black/30 transition-all duration-500"></div>
              
              {/* Sparkling Particles Effect - Subtle */}
              <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity pointer-events-none">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                    style={{
                      top: `${Math.random() * 100}%`,
                      left: `${Math.random() * 100}%`,
                      animationDelay: `${i * 0.2}s`,
                      animationDuration: `${2 + Math.random() * 2}s`
                    }}
                  />
                ))}
                {[...Array(4)].map((_, i) => (
                  <div
                    key={`gold-${i}`}
                    className="absolute w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse"
                    style={{
                      top: `${Math.random() * 100}%`,
                      left: `${Math.random() * 100}%`,
                      animationDelay: `${i * 0.3}s`,
                      animationDuration: `${1.5 + Math.random() * 1.5}s`
                    }}
                  />
                ))}
              </div>
              
              {/* Hover Effect - Red Glow */}
              <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-all duration-500"></div>
            </div>

            {/* Bottom Content Area */}
            <div className="p-6 text-center bg-white flex-grow flex flex-col items-center justify-center space-y-2">
              <h3 className="font-black text-lg lg:text-xl italic uppercase leading-tight group-hover:text-primary transition-colors">
                {language === 'ar' ? cat.nameAr : cat.nameEn}
              </h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                {language === 'ar' ? cat.nameAr : cat.nameEn}
              </p>
            </div>
            
            {/* Bottom Glow Bar */}
            <div className="h-1.5 w-0 group-hover:w-full bg-primary transition-all duration-500 mx-auto"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Categories;
