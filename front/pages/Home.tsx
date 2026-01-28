
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
      
      {/* Before/After Hero Section - Transformation Showcase */}
      <section className="relative min-h-screen bg-secondary text-white overflow-hidden flex items-center py-20">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(211,16,16,0.15),transparent_60%)]"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40"></div>

        <div className="container mx-auto px-4 lg:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-center">
            
            {/* BEFORE - Left Side */}
            <div className="relative h-[300px] sm:h-[400px] lg:h-[500px] group order-2 lg:order-1 animate-in fade-in slide-in-from-left-20 duration-1000">
              <div className="absolute inset-0 grayscale opacity-70 group-hover:opacity-100 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 rounded-[2.5rem] overflow-hidden shadow-2xl">
                <img
                  src="https://cdn.pixabay.com/photo/2024/12/01/23/12/ai-generated-9238589_1280.jpg?auto=format&fit=crop&w=800&q=80"
                  className="w-full h-full object-cover"
                  alt={language === 'ar' ? 'قبل' : 'Before'}
                  onError={(e) => (e.currentTarget.src = "https://images.unsplash.com/photo-1599058917212-d750089bc07f?q=80&w=800&auto=format&fit=crop")}
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent rounded-[2.5rem] group-hover:from-black/60 transition-all"></div>
              <span className={`absolute bottom-4 lg:bottom-6 ${language === 'ar' ? 'right-4 lg:right-6' : 'left-4 lg:left-6'} bg-white/20 backdrop-blur-md px-4 lg:px-6 py-1.5 lg:py-2 rounded-full text-[10px] lg:text-xs font-black tracking-widest border border-white/30`}>
                {language === 'ar' ? 'قبل' : 'BEFORE'}
              </span>
            </div>

            {/* CENTER CONTENT */}
            <div className="text-center space-y-6 lg:space-y-8 order-1 lg:order-2 animate-in fade-in zoom-in duration-1000 delay-300">
              <div className="inline-flex items-center gap-2 bg-primary/20 backdrop-blur-md border border-primary/30 px-4 lg:px-6 py-1.5 lg:py-2 rounded-full text-xs lg:text-sm font-black uppercase tracking-[0.2em] text-primary mb-4">
                <Zap size={16} className="lg:w-[18px] lg:h-[18px]" fill="currentColor" /> {language === 'ar' ? 'التحول' : 'TRANSFORMATION'}
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black italic uppercase leading-tight">
                {t('heroTitle').split(' ').map((word, i) => (
                  <span key={i} className={i === 2 ? 'text-primary block' : ''}>{word} </span>
                ))}
              </h1>

              <p className="text-base lg:text-lg xl:text-xl text-gray-300 font-bold max-w-md mx-auto leading-relaxed px-4">
                {language === 'ar' ? 'مش مكمل غذائي… دي نقطة التحول في مستواك' : 'Not just a supplement... This is your transformation point'}
              </p>

              <button 
                onClick={() => onNavigate('shop')}
                className="bg-primary hover:bg-white hover:text-primary text-white font-black px-8 lg:px-10 py-4 lg:py-5 rounded-full uppercase italic hover:scale-105 transition-all transform shadow-2xl shadow-primary/30 flex items-center gap-3 mx-auto text-sm lg:text-base"
              >
                {language === 'ar' ? 'ابدأ التحول' : 'Start Transformation'}
                {language === 'ar' ? <ArrowLeft size={18} className="lg:w-5 lg:h-5" /> : <ArrowRight size={18} className="lg:w-5 lg:h-5" />}
              </button>

              {/* Stats */}
              <div className="flex justify-center gap-6 lg:gap-8 xl:gap-12 pt-4 lg:pt-6">
                <div className="bg-white/5 backdrop-blur-md px-4 lg:px-6 py-3 lg:py-4 rounded-2xl border border-white/10">
                  <p className="text-2xl lg:text-3xl xl:text-4xl font-black text-primary">+30%</p>
                  <p className="text-[9px] lg:text-[10px] tracking-widest opacity-70 mt-1">{language === 'ar' ? 'قوة' : 'STRENGTH'}</p>
                </div>
                <div className="bg-white/5 backdrop-blur-md px-4 lg:px-6 py-3 lg:py-4 rounded-2xl border border-white/10">
                  <p className="text-2xl lg:text-3xl xl:text-4xl font-black text-primary">{language === 'ar' ? '8 أسابيع' : '8 WEEKS'}</p>
                  <p className="text-[9px] lg:text-[10px] tracking-widest opacity-70 mt-1">{language === 'ar' ? 'نتائج' : 'RESULTS'}</p>
                </div>
              </div>
            </div>

            {/* AFTER - Right Side */}
            <div className="relative h-[300px] sm:h-[400px] lg:h-[500px] group order-3 animate-in fade-in slide-in-from-right-20 duration-1000 delay-500">
              <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-primary/20">
                <img
                  src="https://images.unsplash.com/photo-1605296867304-46d5465a13f1?q=80&w=800"
                  className="w-full h-full object-cover group-hover:scale-110 group-hover:brightness-110 transition-all duration-700"
                  alt={language === 'ar' ? 'بعد' : 'After'}
                  onError={(e) => (e.currentTarget.src = "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800&auto=format&fit=crop")}
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent rounded-[2.5rem] group-hover:from-black/40 transition-all"></div>
              <span className={`absolute bottom-4 lg:bottom-6 ${language === 'ar' ? 'left-4 lg:left-6' : 'right-4 lg:right-6'} bg-primary px-4 lg:px-6 py-1.5 lg:py-2 rounded-full text-[10px] lg:text-xs font-black tracking-widest shadow-xl`}>
                {language === 'ar' ? 'بعد' : 'AFTER'}
              </span>
            </div>

          </div>
        </div>
      </section>

      {/* Brands Slider - Animated Premium Slider */}
      {brands.length > 0 && (
        <section className="container mx-auto px-4 overflow-hidden border-b border-gray-100 pb-20">
          <div className="text-center mb-16">
            <p className="text-primary font-black text-xs uppercase tracking-[0.5em] mb-4">{t('ourBrands')}</p>
            <h2 className="text-4xl font-black italic uppercase tracking-tighter">{t('trustedBrands')}</h2>
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
                      <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-gray-100 group-hover:shadow-primary/20 group-hover:border-primary/50 group-hover:-translate-y-3 transition-all flex items-center justify-center w-36 h-28 lg:w-48 lg:h-36 relative overflow-hidden">
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
                      <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-gray-100 group-hover:shadow-primary/20 group-hover:border-primary/50 group-hover:-translate-y-3 transition-all flex items-center justify-center w-36 h-28 lg:w-48 lg:h-36 relative overflow-hidden">
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

      {/* Categories Sections */}
      {!loading && categories.slice(0, 4).map((category) => {
        const categoryProducts = products.filter(p => p.category === category.slug || p.category_id === category.id);
        if (categoryProducts.length === 0) return null;

        return (
          <section key={category.id} className="container mx-auto px-4">
            <div className="flex items-end justify-between mb-12 border-r-8 border-primary pr-6">
              <div>
                <h2 className="text-4xl lg:text-5xl font-black italic uppercase tracking-tighter">
                  {language === 'ar' ? category.nameAr : category.nameEn}
                </h2>
                <div className="w-24 h-1.5 bg-primary/20 mt-2 rounded-full"></div>
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
          <div className="bg-accent/40 rounded-[4rem] p-12 lg:p-20 grid grid-cols-2 lg:grid-cols-4 gap-12 text-center border border-white shadow-inner">
            {stats.slice(0, 4).map((stat: any, i: number) => {
              // Map icon names to components
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
                <div key={stat.id || i} className="space-y-2 group">
                  <div className="transform group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="text-primary mx-auto mb-4" size={32} />
                  </div>
                  <h3 className="text-4xl lg:text-5xl font-black italic text-secondary">{stat.stat_value}</h3>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{statLabel}</p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Shop By Goal */}
      {goals.length > 0 && (
        <section className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black italic uppercase mb-4 tracking-tighter">{t('shopByGoal')}</h2>
            <div className="w-24 h-2 bg-primary mx-auto rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {goals.map((goal: any) => {
              const IconComponent = goal.icon_name === 'flame' ? Flame :
                                   goal.icon_name === 'target' ? Target :
                                   goal.icon_name === 'zap' ? Zap :
                                   goal.icon_name === 'trophy' ? Trophy : Target;
              const goalTitle = language === 'ar' ? goal.title_ar : goal.title_en;
              
              return (
                <div 
                  key={goal.id}
                  onClick={() => onNavigate('shop')}
                  className="group relative h-96 rounded-[3.5rem] overflow-hidden cursor-pointer shadow-xl hover:-translate-y-4 transition-all duration-500"
                >
                  <div className={`absolute inset-0 ${goal.color_gradient} opacity-90 group-hover:opacity-100 transition-opacity`}></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  <div className="absolute inset-0 p-12 flex flex-col justify-between text-white">
                    <div className="bg-white/20 w-24 h-24 rounded-[2rem] flex items-center justify-center backdrop-blur-md border border-white/30 group-hover:rotate-12 transition-transform shadow-xl">
                      <IconComponent size={40} />
                    </div>
                    <div>
                      <h3 className="text-4xl font-black italic uppercase leading-none mb-3">{goalTitle}</h3>
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

      {/* Deal of the Day - From Database */}
      {activeDeal && (
        <section className="container mx-auto px-4">
          <div className="bg-secondary text-white rounded-[5rem] p-10 lg:p-24 relative overflow-hidden flex flex-col lg:flex-row items-center gap-16 shadow-2xl">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] -mr-40 -mt-40"></div>
            
            <div className="flex-grow space-y-10 relative z-10 text-center lg:text-right">
              <div className="inline-flex items-center gap-3 bg-primary px-6 py-2.5 rounded-[1.5rem] text-xs font-black uppercase italic">
                <Flame size={18} fill="white" /> {t('dealOfTheDay')}
              </div>
              <h2 className="text-5xl lg:text-8xl font-black italic uppercase leading-[0.85] tracking-tight">
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
                <p className="text-lg lg:text-xl text-gray-300 font-bold">
                  {language === 'ar' ? activeDeal.description_ar : activeDeal.description_en}
                </p>
              )}
              {activeDeal.discount_percentage && (
                <div className="inline-block bg-primary/20 px-6 py-3 rounded-2xl border border-primary/30">
                  <p className="text-3xl font-black">
                    {language === 'ar' ? 'خصم' : 'Discount'} {activeDeal.discount_percentage}%
                  </p>
                </div>
              )}
              <div className="flex justify-center lg:justify-start gap-5 text-center">
                {[
                  { val: countdown.hours, label: t('hours') },
                  { val: countdown.mins, label: t('minutes') },
                  { val: countdown.secs, label: t('seconds') }
                ].map((c, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-[2rem] p-5 w-28 backdrop-blur-md">
                    <p className="text-4xl font-black italic text-primary">{c.val}</p>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{c.label}</p>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => activeDeal.product_id ? onNavigate('product', { id: activeDeal.product_id }) : onNavigate('shop')}
                className="bg-white text-secondary font-black px-14 py-6 rounded-[2rem] hover:bg-primary hover:text-white transition-all uppercase italic text-xl shadow-2xl transform active:scale-95"
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