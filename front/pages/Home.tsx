
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import { brandsAPI, dealsAPI, goalsAPI, categoriesAPI, productsAPI, statsAPI, getFullUrl } from '../utils/api';
import { 
  ArrowLeft, 
  ArrowRight, 
  Zap, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Timer, 
  Flame, 
  Trophy, 
  Users, 
  Target,
  Instagram,
  ShoppingBag,
  Play,
  Star
} from 'lucide-react';

interface HomeProps {
  onNavigate: (page: string, params?: any) => void;
}

const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const { t, language } = useLanguage();
  const { addToCart } = useCart();
  const [countdown, setCountdown] = useState({ hours: 0, mins: 0, secs: 0 });
  const [brands, setBrands] = useState<any[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [activeDeal, setActiveDeal] = useState<any>(null);
  const [goals, setGoals] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch brands from database
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoadingBrands(true);
        const response = await brandsAPI.getAllBrands(true); // Get only active brands
        if (response.success && response.data?.brands) {
          // Format logo URLs to full URLs if needed
          const formattedBrands = response.data.brands.map((brand: any) => {
            let logoUrl = brand.logo_url || null;
            if (logoUrl && !logoUrl.startsWith('http')) {
              logoUrl = getFullUrl(logoUrl);
            }
            return {
              ...brand,
              logo_url: logoUrl
            };
          });
          setBrands(formattedBrands);
        }
      } catch (err) {
        console.error('Failed to fetch brands:', err);
        // Fallback to empty array if API fails
        setBrands([]);
      } finally {
        setLoadingBrands(false);
      }
    };

    fetchBrands();
  }, []);

  // Fetch active deal from database
  useEffect(() => {
    const fetchActiveDeal = async () => {
      try {
        const response = await dealsAPI.getActiveDeal();
        if (response.success && response.data?.deal) {
          const deal = response.data.deal;
          // Format image URL if needed
          let imageUrl = deal.image_url || null;
          console.log('Deal image URL:', imageUrl);
          if (imageUrl && !imageUrl.startsWith('http')) {
            imageUrl = getFullUrl(imageUrl);
            console.log('Formatted deal image URL:', imageUrl);
          }
          setActiveDeal({ ...deal, image_url: imageUrl });
          
          // Calculate countdown from end_date
          const endDate = new Date(deal.end_date);
          updateCountdown(endDate);
        } else {
          setActiveDeal(null);
        }
      } catch (err) {
        console.error('Failed to fetch active deal:', err);
        setActiveDeal(null);
      }
    };

    fetchActiveDeal();
  }, []);

  // Update countdown timer based on deal end_date
  const updateCountdown = (endDate: Date) => {
    const update = () => {
      const now = new Date();
      const diff = endDate.getTime() - now.getTime();
      
      if (diff > 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        setCountdown({ hours, mins, secs });
      } else {
        setCountdown({ hours: 0, mins: 0, secs: 0 });
      }
    };

    update(); // Initial update
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  };

  // Countdown Timer for Deal of the Day
  useEffect(() => {
    if (!activeDeal) return;
    
    const endDate = new Date(activeDeal.end_date);
    const timer = setInterval(() => {
      const now = new Date();
      const diff = endDate.getTime() - now.getTime();
      
      if (diff > 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        setCountdown({ hours, mins, secs });
      } else {
        setCountdown({ hours: 0, mins: 0, secs: 0 });
        // Optionally refresh deal when expired
        setActiveDeal(null);
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [activeDeal]);

  const handleAddToCart = (e: React.MouseEvent, product: any) => {
    e.stopPropagation();
    addToCart(product, 1, '');
  };

  // Fetch goals from database
  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const response = await goalsAPI.getAllGoals(true); // Get only active goals
        console.log('Goals API Response:', response);
        if (response.success && response.data?.goals) {
          console.log('Goals fetched:', response.data.goals);
          setGoals(response.data.goals);
        } else {
          console.log('No goals found in response');
          setGoals([]);
        }
      } catch (err) {
        console.error('Failed to fetch goals:', err);
        setGoals([]);
      }
    };

    fetchGoals();
  }, []);

  // Fetch categories from database
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoriesAPI.getAllCategories();
        if (response.success && response.data?.categories) {
          const formattedCategories = response.data.categories.map((cat: any) => {
            let imageUrl = cat.image_url || null;
            if (imageUrl && !imageUrl.startsWith('http')) {
              imageUrl = getFullUrl(imageUrl);
            }
            return {
              ...cat,
              nameAr: cat.name,
              nameEn: cat.name_en || cat.name,
              image: imageUrl,
              slug: cat.slug || `category-${cat.id}`
            };
          });
          setCategories(formattedCategories);
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        setCategories([]);
      }
    };

    fetchCategories();
  }, []);

  // Fetch products from database
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productsAPI.getAllProducts({ limit: 20 });
        console.log('Products API Response:', response);
        if (response.success && response.data?.products) {
          const formattedProducts = response.data.products.map((product: any) => {
            // Format product images
            let mainImage = product.image || null;
            console.log('Product:', product.nameAr || product.name, 'Original image:', mainImage);
            if (mainImage && !mainImage.startsWith('http')) {
              mainImage = getFullUrl(mainImage);
              console.log('Formatted mainImage:', mainImage);
            }
            
            return {
              ...product,
              nameAr: product.name_ar || product.name,
              nameEn: product.name_en || product.name,
              image: mainImage,
              category: product.category_slug || product.category,
              oldPrice: product.old_price || null,
              rating: product.average_rating || 0,
              reviewsCount: product.reviews_count || 0,
              weight: product.weight || '',
              flavor: product.flavors ? product.flavors.split(',') : [],
              stock: product.stock || 0
            };
          });
          setProducts(formattedProducts);
        }
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Fetch stats from database
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await statsAPI.getAllStats(true); // Get only active stats
        if (response.success && response.data?.stats) {
          setStats(response.data.stats);
        }
      } catch (err) {
        console.error('Failed to fetch stats:', err);
        setStats([]);
      }
    };

    fetchStats();
  }, []);

  const getLogoUrl = (brand: any) => {
    if (brand.logo_url) {
      return brand.logo_url;
    }
    // Fallback to domain-based logo if no logo_url
    if (brand.website_url) {
      try {
        const domain = new URL(brand.website_url).hostname.replace('www.', '');
        return `https://logo.clearbit.com/${domain}`;
      } catch {
        return null;
      }
    }
    return null;
  };

  const getFallbackLogoUrl = (brand: any) => {
    if (brand.website_url) {
      try {
        const domain = new URL(brand.website_url).hostname;
        return `https://www.google.com/s2/favicons?sz=128&domain=${domain}`;
      } catch {
        return null;
      }
    }
    return null;
  };

  return (
    <div className="space-y-24 pb-24">
      
      {/* Hero Section - Premium Stylish Design */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-32 lg:py-44 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #D31010 0%, transparent 50%),
                              radial-gradient(circle at 75% 75%, #D31010 0%, transparent 50%)`
          }}></div>
        </div>
        
        {/* Animated Glow Behind Title */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/20 blur-[120px] rounded-full"></div>
        
        <div className="container mx-auto px-4 lg:px-6 relative z-10">
          <div className="text-center space-y-8 max-w-5xl mx-auto">
            {/* Main Title with Gradient and Glow */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black uppercase leading-[1.1] bg-gradient-to-r from-primary via-red-500 to-primary bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(211,16,16,0.5)] animate-pulse">
              {t('heroTitle')}
            </h1>
            
            {/* Decorative Line */}
            <div className="flex items-center justify-center gap-4">
              <div className="h-1 w-16 bg-gradient-to-r from-transparent to-primary rounded-full"></div>
              <div className="w-3 h-3 bg-primary rotate-45"></div>
              <div className="h-1 w-16 bg-gradient-to-l from-transparent to-primary rounded-full"></div>
            </div>
            
            {/* Subtitle with Better Styling */}
            <p className="text-xl lg:text-2xl text-gray-300 font-bold max-w-2xl mx-auto leading-relaxed tracking-wide">
              <span className="text-primary">{language === 'ar' ? 'مش مكمل غذائي…' : 'Not just a supplement…'}</span>
              <br />
              <span className="text-white/80">{language === 'ar' ? 'دي نقطة التحول في مستواك' : 'This is your transformation point'}</span>
            </p>
            
            {/* CTA Button */}
            <div className="pt-4">
              <button 
                onClick={() => onNavigate('shop')}
                className="group relative bg-primary hover:bg-red-600 text-white font-black px-10 py-5 rounded-full uppercase tracking-wider text-lg shadow-[0_0_40px_rgba(211,16,16,0.4)] hover:shadow-[0_0_60px_rgba(211,16,16,0.6)] transition-all duration-300 transform hover:scale-105"
              >
                <span className="relative z-10 flex items-center gap-3">
                  {language === 'ar' ? 'اكتشف المكملات' : 'Explore Supplements'}
                  {language === 'ar' ? <ArrowLeft size={20} className="group-hover:-translate-x-2 transition-transform" /> : <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />}
                </span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Bottom Gradient Fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-50 to-transparent"></div>
      </section>

      {/* Shop By Goal - Now First */}
      {goals.length > 0 && (
        <section className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black italic uppercase mb-4 tracking-tighter">{t('shopByGoal')}</h2>
            <div className="w-16 md:w-24 h-1.5 md:h-2 bg-primary mx-auto rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {goals.map((goal: any) => {
              const IconComponent = goal.icon_name === 'flame' ? Flame :
                                   goal.icon_name === 'target' ? Target :
                                   goal.icon_name === 'zap' ? Zap :
                                   goal.icon_name === 'trophy' ? Trophy : Target;
              const goalTitle = language === 'ar' ? goal.title_ar : goal.title_en;
              
              return (
                <div 
                  key={goal.id}
                  onClick={() => onNavigate('shop', { goal_id: goal.id })}
                  className="group relative h-64 md:h-80 lg:h-96 rounded-[2rem] md:rounded-[3rem] lg:rounded-[3.5rem] overflow-hidden cursor-pointer shadow-lg md:shadow-xl hover:-translate-y-2 md:hover:-translate-y-4 transition-all duration-500"
                >
                  <div className={`absolute inset-0 ${goal.color_gradient} opacity-90 group-hover:opacity-100 transition-opacity`}></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  <div className="absolute inset-0 p-6 md:p-10 lg:p-12 flex flex-col justify-between text-white">
                    <div className="bg-white/20 w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-[1.5rem] md:rounded-[1.75rem] lg:rounded-[2rem] flex items-center justify-center backdrop-blur-md border border-white/30 group-hover:rotate-12 transition-transform shadow-lg md:shadow-xl">
                      <IconComponent size={28} className="md:w-8 md:h-8 lg:w-10 lg:h-10" />
                    </div>
                    <div>
                      <h3 className="text-2xl md:text-3xl lg:text-4xl font-black italic uppercase leading-none mb-2 md:mb-3">{goalTitle}</h3>
                      <div className="flex items-center gap-2 overflow-hidden w-0 group-hover:w-full transition-all duration-500">
                        <span className="text-[10px] font-black opacity-70 uppercase tracking-[0.2em] whitespace-nowrap">
                          {language === 'ar' ? 'استكشف المنتجات' : 'Explore Products'}
                        </span>
                        {language === 'ar' ? <ArrowLeft size={14} className="text-white" /> : <ArrowRight size={14} className="text-white" />}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Best Selling Products Section */}
      {products.length > 0 && (
        <section className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 md:mb-12 gap-4 border-r-4 md:border-r-8 border-primary pr-4 md:pr-6">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black italic uppercase tracking-tighter">
                {language === 'ar' ? 'المنتجات الأكثر مبيعاً' : 'Best Selling Products'}
              </h2>
              <div className="w-16 md:w-24 h-1 md:h-1.5 bg-primary/20 mt-2 rounded-full"></div>
            </div>
            <button 
              onClick={() => onNavigate('bestsellers')}
              className="text-primary font-black uppercase italic text-sm hover:translate-x-[-10px] transition-transform flex items-center gap-2"
            >
              {language === 'ar' ? 'عرض الكل' : 'View All'}
              {language === 'ar' ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {products
              .sort((a, b) => (b.sales_count || 0) - (a.sales_count || 0))
              .slice(0, 4)
              .map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onClick={(id) => onNavigate('product', { id })}
                  onAddToCart={handleAddToCart}
                />
              ))}
          </div>
        </section>
      )}

      {!loading && categories.slice(0, 4).map((category) => {
        const categoryProducts = products.filter(p => p.category === category.slug || p.category_id === category.id);
        if (categoryProducts.length === 0) return null;

        return (
          <section key={category.id} className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 md:mb-12 gap-4 border-r-4 md:border-r-8 border-primary pr-4 md:pr-6">
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black italic uppercase tracking-tighter">
                  {language === 'ar' ? category.nameAr : category.nameEn}
                </h2>
                <div className="w-16 md:w-24 h-1 md:h-1.5 bg-primary/20 mt-2 rounded-full"></div>
              </div>
              <button 
                onClick={() => onNavigate('shop', { category: category.slug })}
                className="text-primary font-black uppercase italic text-sm hover:translate-x-[-10px] transition-transform flex items-center gap-2"
              >
                {language === 'ar' ? 'عرض الكل' : 'View All'}
                {language === 'ar' ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
              {categoryProducts.slice(0, 4).map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onClick={(id) => onNavigate('product', { id })}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          </section>
        );
      })}

      {/* Stats Section */}
      {stats.length > 0 && (
        <section className="container mx-auto px-4">
          <div className="bg-accent/40 rounded-[2rem] md:rounded-[4rem] p-6 md:p-12 lg:p-20 grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-12 text-center border border-white shadow-inner">
            {stats.slice(0, 4).map((stat: any, i: number) => {
              const iconMap: { [key: string]: any } = {
                'users': Users,
                'shield': ShieldCheck,
                'trophy': Trophy,
                'flame': Flame,
                'star': Star,
                'truck': Truck,
                'timer': Timer
              };
              const IconComponent = iconMap[stat.icon_name] || Trophy;
              const statLabel = language === 'ar' ? stat.stat_label_ar : stat.stat_label_en;
              
              return (
                <div key={stat.id || i} className="space-y-1 md:space-y-2 group">
                  <div className="transform group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="text-primary mx-auto mb-2 md:mb-4" size={24} />
                  </div>
                  <h3 className="text-2xl md:text-4xl lg:text-5xl font-black italic text-secondary">{stat.stat_value}</h3>
                  <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">{statLabel}</p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Deal of the Day - From Database */}
      {activeDeal && (
        <section className="container mx-auto px-4">
          <div className="bg-secondary text-white rounded-[3rem] md:rounded-[5rem] p-6 md:p-10 lg:p-24 relative overflow-hidden flex flex-col lg:flex-row items-center gap-8 md:gap-16 shadow-2xl">
            <div className="absolute top-0 right-0 w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-primary/10 rounded-full blur-[60px] md:blur-[120px] -mr-20 md:-mr-40 -mt-20 md:-mt-40"></div>
            
            <div className="flex-grow space-y-6 md:space-y-10 relative z-10 text-center lg:text-right">
              <div className="inline-flex items-center gap-3 bg-primary px-4 md:px-6 py-2 md:py-2.5 rounded-[1.5rem] text-[10px] md:text-xs font-black uppercase italic">
                <Flame size={16} className="md:w-[18px] md:h-[18px]" fill="white" /> {t('dealOfTheDay')}
              </div>
              <h2 className="text-3xl md:text-5xl lg:text-8xl font-black italic uppercase leading-[0.85] tracking-tight">
                {language === 'ar' ? (
                  <>
                    {activeDeal.title_ar?.split(' ').map((word: string, i: number) => (
                      <span key={i} className={i === 0 ? 'text-primary' : ''}>{word} </span>
                    ))}
                  </>
                ) : (
                  <>
                    {activeDeal.title_en?.split(' ').map((word: string, i: number) => (
                      <span key={i} className={i === 0 ? 'text-primary' : ''}>{word} </span>
                    ))}
                  </>
                )}
              </h2>
              {activeDeal.description_ar && (
                <p className="text-sm md:text-lg lg:text-xl text-gray-300 font-bold">
                  {language === 'ar' ? activeDeal.description_ar : activeDeal.description_en}
                </p>
              )}
              {activeDeal.discount_percentage && (
                <div className="inline-block bg-primary/20 px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl border border-primary/30">
                  <p className="text-xl md:text-3xl font-black">
                    {language === 'ar' ? 'خصم' : 'Discount'} {activeDeal.discount_percentage}%
                  </p>
                </div>
              )}
              <div className="flex justify-center lg:justify-start gap-3 md:gap-5 text-center">
                {[
                  { val: countdown.hours, label: t('hours') },
                  { val: countdown.mins, label: t('minutes') },
                  { val: countdown.secs, label: t('seconds') }
                ].map((c, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-[1.5rem] md:rounded-[2rem] p-3 md:p-5 w-20 md:w-28 backdrop-blur-md">
                    <p className="text-2xl md:text-4xl font-black italic text-primary">{c.val}</p>
                    <p className="text-[8px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest">{c.label}</p>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => activeDeal.product_id ? onNavigate('product', { id: activeDeal.product_id }) : onNavigate('shop')}
                className="bg-white text-secondary font-black px-8 md:px-14 py-4 md:py-6 rounded-[1.5rem] md:rounded-[2rem] hover:bg-primary hover:text-white transition-all uppercase italic text-base md:text-xl shadow-2xl transform active:scale-95"
              >
                {t('claimOffer')}
              </button>
            </div>
            
            <div className="w-full lg:w-1/2 relative group">
              <div className="absolute inset-0 bg-primary/20 blur-[100px] group-hover:bg-primary/40 transition-all duration-700"></div>
              {activeDeal.image_url ? (
                <img 
                  src={activeDeal.image_url} 
                  className="w-full h-auto object-contain relative z-10 animate-float" 
                  alt={language === 'ar' ? activeDeal.title_ar : activeDeal.title_en}
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1546483875-ad9014c88eba?q=80&w=1000&auto=format&fit=crop";
                  }}
                />
              ) : activeDeal.product_image ? (
                <img 
                  src={activeDeal.product_image} 
                  className="w-full h-auto object-contain relative z-10 animate-float" 
                  alt={language === 'ar' ? activeDeal.title_ar : activeDeal.title_en}
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1546483875-ad9014c88eba?q=80&w=1000&auto=format&fit=crop";
                  }}
                />
              ) : (
                <img 
                  src="https://images.unsplash.com/photo-1546483875-ad9014c88eba?q=80&w=1000&auto=format&fit=crop" 
                  className="w-full h-auto object-contain relative z-10 animate-float" 
                  alt="Flash sale product" 
                  onError={(e) => (e.currentTarget.src = "https://images.unsplash.com/photo-1593095191850-2a7330053bb4?q=80&w=1000&auto=format&fit=crop")}
                />
              )}
            </div>
          </div>
        </section>
      )}

      {/* Brands Slider - At Bottom */}
      {brands.length > 0 && (
        <section className="container mx-auto px-4 overflow-hidden border-b border-gray-100 pb-12 md:pb-20">
          <div className="text-center mb-8 md:mb-16">
            <p className="text-primary font-black text-[10px] md:text-xs uppercase tracking-[0.3em] md:tracking-[0.5em] mb-2 md:mb-4">{t('ourBrands')}</p>
            <h2 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter">{t('trustedBrands')}</h2>
          </div>
          
          {/* Slider Container */}
          <div className="relative">
            {/* Gradient Overlays for Smooth Edges */}
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>
            
            {/* Infinite Scrolling Slider */}
            <div className="overflow-hidden">
              <div className={`flex gap-8 lg:gap-16 ${language === 'ar' ? 'animate-scroll-rtl' : 'animate-scroll-ltr'}`}>
                {/* First Set */}
                {brands.map((brand, i) => {
                  const logoUrl = getLogoUrl(brand);
                  const fallbackUrl = getFallbackLogoUrl(brand);
                  const brandName = language === 'ar' ? brand.name : (brand.name_en || brand.name);
                  
                  return (
                    <div key={`first-${brand.id}-${i}`} className="group flex flex-col items-center gap-4 shrink-0 transition-all duration-500">
                      <div className="bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] shadow-lg md:shadow-xl border border-gray-100 group-hover:shadow-primary/20 group-hover:border-primary/50 group-hover:-translate-y-2 md:group-hover:-translate-y-3 transition-all flex items-center justify-center w-24 h-20 md:w-36 md:h-28 lg:w-48 lg:h-36 relative overflow-hidden">
                        {logoUrl ? (
                          <img 
                            src={logoUrl} 
                            alt={brandName} 
                            className="max-h-[85%] max-w-[85%] object-contain transition-all duration-500 group-hover:scale-110"
                            onError={(e) => {
                              const target = e.currentTarget;
                              if (fallbackUrl && target.src !== fallbackUrl) {
                                target.src = fallbackUrl;
                              } else {
                                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(brandName)}&background=D31010&color=fff&size=200&bold=true`;
                              }
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-xl">
                            <span className="text-gray-400 text-xs font-bold">{brandName}</span>
                          </div>
                        )}
                      </div>
                      <span className="text-xs font-black uppercase text-gray-500 group-hover:text-primary tracking-widest opacity-60 group-hover:opacity-100 transition-all whitespace-nowrap">{brandName}</span>
                    </div>
                  );
                })}
                {/* Duplicate Set for Infinite Loop */}
                {brands.map((brand, i) => {
                  const logoUrl = getLogoUrl(brand);
                  const fallbackUrl = getFallbackLogoUrl(brand);
                  const brandName = language === 'ar' ? brand.name : (brand.name_en || brand.name);
                  
                  return (
                    <div key={`second-${brand.id}-${i}`} className="group flex flex-col items-center gap-4 shrink-0 transition-all duration-500">
                      <div className="bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] shadow-lg md:shadow-xl border border-gray-100 group-hover:shadow-primary/20 group-hover:border-primary/50 group-hover:-translate-y-2 md:group-hover:-translate-y-3 transition-all flex items-center justify-center w-24 h-20 md:w-36 md:h-28 lg:w-48 lg:h-36 relative overflow-hidden">
                        {logoUrl ? (
                          <img 
                            src={logoUrl} 
                            alt={brandName} 
                            className="max-h-[85%] max-w-[85%] object-contain transition-all duration-500 group-hover:scale-110"
                            onError={(e) => {
                              const target = e.currentTarget;
                              if (fallbackUrl && target.src !== fallbackUrl) {
                                target.src = fallbackUrl;
                              } else {
                                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(brandName)}&background=D31010&color=fff&size=200&bold=true`;
                              }
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-xl">
                            <span className="text-gray-400 text-xs font-bold">{brandName}</span>
                          </div>
                        )}
                      </div>
                      <span className="text-xs font-black uppercase text-gray-500 group-hover:text-primary tracking-widest opacity-60 group-hover:opacity-100 transition-all whitespace-nowrap">{brandName}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0); }
          50% { transform: translateY(-30px) rotate(2deg); }
        }
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-in-from-left {
          from { opacity: 0; transform: translateX(-50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slide-in-from-right {
          from { opacity: 0; transform: translateX(50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes zoom-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-in {
          animation-fill-mode: both;
        }
        .fade-in {
          animation: fade-in 1s ease-out;
        }
        .slide-in-from-left-20 {
          animation: slide-in-from-left 1s ease-out;
        }
        .slide-in-from-right-20 {
          animation: slide-in-from-right 1s ease-out;
        }
        .zoom-in {
          animation: zoom-in 1s ease-out;
        }
        .duration-1000 {
          animation-duration: 1s;
        }
        .delay-300 {
          animation-delay: 0.3s;
        }
        .delay-500 {
          animation-delay: 0.5s;
        }
        @keyframes scroll-rtl {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-50% - 2rem));
          }
        }
        @keyframes scroll-ltr {
          0% {
            transform: translateX(calc(-50% - 2rem));
          }
          100% {
            transform: translateX(0);
          }
        }
        .animate-scroll-rtl {
          animation: scroll-rtl 30s linear infinite;
          display: flex;
          width: fit-content;
        }
        .animate-scroll-ltr {
          animation: scroll-ltr 30s linear infinite;
          display: flex;
          width: fit-content;
        }
        .animate-scroll-rtl:hover,
        .animate-scroll-ltr:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default Home;