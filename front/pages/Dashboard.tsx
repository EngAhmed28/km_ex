import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { dashboardAPI } from '../utils/api';
import { User, ShoppingBag, DollarSign, Calendar, Package, FolderTree, Clock, CheckCircle, Truck, Star, ArrowRight, Eye, Heart } from 'lucide-react';
import AdminDashboard from './AdminDashboard';
import ProductCard from '../components/ProductCard';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

interface DashboardData {
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    created_at: string;
  };
  stats: {
    ordersCount?: number;
    totalSpent?: number;
    memberSince?: string;
    totalUsers?: number;
    totalProducts?: number;
    totalOrders?: number;
    totalCategories?: number;
    productsCount?: number;
    ordersCount?: number;
    categoriesCount?: number;
    recentOrders?: Array<{
      id: number;
      total_amount: number;
      status: string;
      created_at: string;
      payment_method?: string;
    }>;
    ordersByStatus?: {
      [key: string]: number;
    };
    recommendedProducts?: Array<{
      id: number;
      name: string;
      name_en?: string;
      name_ar?: string;
      price: number;
      old_price?: number;
      image_url?: string;
      rating: number;
      reviews_count: number;
      slug: string;
    }>;
  };
  permissions?: any[];
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { user, logout } = useAuth();
  const { language, t } = useLanguage();
  const { addToCart } = useCart();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await dashboardAPI.getDashboard();
        if (response.success) {
          setDashboardData(response.data);
        } else {
          setError('فشل تحميل بيانات الداشبورد');
        }
      } catch (err: any) {
        setError(err.message || 'حدث خطأ أثناء تحميل البيانات');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  // Redirect to admin dashboard if admin
  if (user && user.role === 'admin') {
    return <AdminDashboard onNavigate={onNavigate} />;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-bold mb-4">يجب تسجيل الدخول أولاً</p>
          <button
            onClick={() => onNavigate('login')}
            className="bg-primary text-white px-6 py-3 rounded-2xl font-bold hover:bg-secondary transition-all"
          >
            تسجيل الدخول
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl font-bold">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-3xl p-8 mb-6 shadow-lg">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-black mb-2">مرحباً، {user.name}</h1>
              <p className="text-gray-500 font-bold">{user.email}</p>
            </div>
            <button
              onClick={logout}
              className="bg-red-500 text-white px-6 py-3 rounded-2xl font-bold hover:bg-red-600 transition-all"
            >
              تسجيل الخروج
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 font-bold border border-red-100">
            {error}
          </div>
        )}

        {/* Stats Cards - Different based on role */}
        {dashboardData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {user.role === 'customer' ? (
              <>
                <div className="bg-white rounded-3xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-primary/10 p-4 rounded-2xl">
                      <ShoppingBag className="text-primary" size={24} />
                    </div>
                  </div>
                  <h3 className="text-gray-500 text-sm font-bold mb-1">عدد الطلبات</h3>
                  <p className="text-3xl font-black">{dashboardData.stats.ordersCount || 0}</p>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-green-500/10 p-4 rounded-2xl">
                      <DollarSign className="text-green-500" size={24} />
                    </div>
                  </div>
                  <h3 className="text-gray-500 text-sm font-bold mb-1">إجمالي المشتريات</h3>
                  <p className="text-3xl font-black">{(dashboardData.stats.totalSpent || 0).toFixed(2)} ج.م</p>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-blue-500/10 p-4 rounded-2xl">
                      <Calendar className="text-blue-500" size={24} />
                    </div>
                  </div>
                  <h3 className="text-gray-500 text-sm font-bold mb-1">عضو منذ</h3>
                  <p className="text-lg font-black">
                    {dashboardData.stats.memberSince 
                      ? new Date(dashboardData.stats.memberSince).toLocaleDateString('ar-SA')
                      : 'غير متاح'}
                  </p>
                </div>
              </>
            ) : user.role === 'employee' ? (
              <>
                {dashboardData.stats.usersCount !== undefined && (
                  <div className="bg-white rounded-3xl p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-blue-500/10 p-4 rounded-2xl">
                        <User className="text-blue-500" size={24} />
                      </div>
                    </div>
                    <h3 className="text-gray-500 text-sm font-bold mb-1">{language === 'ar' ? 'المستخدمين' : 'Users'}</h3>
                    <p className="text-3xl font-black">{dashboardData.stats.usersCount}</p>
                  </div>
                )}
                {dashboardData.stats.productsCount !== undefined && (
                  <div className="bg-white rounded-3xl p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-green-500/10 p-4 rounded-2xl">
                        <Package className="text-green-500" size={24} />
                      </div>
                    </div>
                    <h3 className="text-gray-500 text-sm font-bold mb-1">{language === 'ar' ? 'المنتجات' : 'Products'}</h3>
                    <p className="text-3xl font-black">{dashboardData.stats.productsCount}</p>
                  </div>
                )}
                {dashboardData.stats.ordersCount !== undefined && (
                  <div className="bg-white rounded-3xl p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-purple-500/10 p-4 rounded-2xl">
                        <ShoppingBag className="text-purple-500" size={24} />
                      </div>
                    </div>
                    <h3 className="text-gray-500 text-sm font-bold mb-1">{language === 'ar' ? 'الطلبات' : 'Orders'}</h3>
                    <p className="text-3xl font-black">{dashboardData.stats.ordersCount}</p>
                  </div>
                )}
                {dashboardData.stats.categoriesCount !== undefined && (
                  <div className="bg-white rounded-3xl p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-orange-500/10 p-4 rounded-2xl">
                        <FolderTree className="text-orange-500" size={24} />
                      </div>
                    </div>
                    <h3 className="text-gray-500 text-sm font-bold mb-1">{language === 'ar' ? 'الأقسام' : 'Categories'}</h3>
                    <p className="text-3xl font-black">{dashboardData.stats.categoriesCount}</p>
                  </div>
                )}
                {dashboardData.permissions && dashboardData.permissions.length > 0 && (
                  <div className="bg-white rounded-3xl p-6 shadow-lg col-span-full">
                    <h3 className="text-xl font-black mb-4">صلاحياتك</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {dashboardData.permissions
                        .filter((perm: any) => perm.can_view === true)
                        .map((perm: any, idx: number) => (
                          <div key={idx} className="bg-gray-50 p-4 rounded-2xl">
                            <h4 className="font-bold mb-2">{perm.permission_type}</h4>
                            <div className="text-sm space-y-1">
                              {perm.can_view && <p className="text-green-600">✓ عرض</p>}
                              {perm.can_create && <p className="text-blue-600">✓ إنشاء</p>}
                              {perm.can_edit && <p className="text-orange-600">✓ تعديل</p>}
                              {perm.can_delete && <p className="text-red-600">✓ حذف</p>}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </>
            ) : null}
          </div>
        )}

        {/* Orders by Status - Customer only */}
        {user.role === 'customer' && dashboardData?.stats?.ordersByStatus && Object.keys(dashboardData.stats.ordersByStatus).length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {dashboardData.stats.ordersByStatus.pending > 0 && (
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border border-yellow-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-yellow-700 font-bold mb-1">{language === 'ar' ? 'قيد الانتظار' : 'Pending'}</p>
                    <p className="text-2xl font-black text-yellow-800">{dashboardData.stats.ordersByStatus.pending}</p>
                  </div>
                  <Clock className="text-yellow-600" size={24} />
                </div>
              </div>
            )}
            {dashboardData.stats.ordersByStatus.processing > 0 && (
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-700 font-bold mb-1">{language === 'ar' ? 'قيد المعالجة' : 'Processing'}</p>
                    <p className="text-2xl font-black text-blue-800">{dashboardData.stats.ordersByStatus.processing}</p>
                  </div>
                  <Package className="text-blue-600" size={24} />
                </div>
              </div>
            )}
            {dashboardData.stats.ordersByStatus.shipped > 0 && (
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-700 font-bold mb-1">{language === 'ar' ? 'تم الشحن' : 'Shipped'}</p>
                    <p className="text-2xl font-black text-purple-800">{dashboardData.stats.ordersByStatus.shipped}</p>
                  </div>
                  <Truck className="text-purple-600" size={24} />
                </div>
              </div>
            )}
            {dashboardData.stats.ordersByStatus.delivered > 0 && (
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-700 font-bold mb-1">{language === 'ar' ? 'تم التسليم' : 'Delivered'}</p>
                    <p className="text-2xl font-black text-green-800">{dashboardData.stats.ordersByStatus.delivered}</p>
                  </div>
                  <CheckCircle className="text-green-600" size={24} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Recent Orders - Customer only */}
        {user.role === 'customer' && dashboardData?.stats?.recentOrders && dashboardData.stats.recentOrders.length > 0 && (
          <div className="bg-white rounded-3xl p-6 shadow-lg mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-black flex items-center gap-2">
                <ShoppingBag className="text-primary" size={24} />
                {language === 'ar' ? 'طلباتي الأخيرة' : 'My Recent Orders'}
              </h2>
              <button
                onClick={() => onNavigate('orders')}
                className="text-primary hover:text-secondary font-bold text-sm flex items-center gap-1"
              >
                {language === 'ar' ? 'عرض الكل' : 'View All'}
                <ArrowRight size={16} />
              </button>
            </div>
            <div className="space-y-3">
              {dashboardData.stats.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-xl">
                      <ShoppingBag className="text-primary" size={20} />
                    </div>
                    <div>
                      <p className="font-bold">#{order.id}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="font-black text-primary mb-1">{parseFloat(order.total_amount || 0).toFixed(2)} {language === 'ar' ? 'ج.م' : 'EGP'}</p>
                    <span className={`text-xs px-2 py-1 rounded-lg font-bold ${
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status === 'pending' ? (language === 'ar' ? 'قيد الانتظار' : 'Pending') :
                       order.status === 'processing' ? (language === 'ar' ? 'قيد المعالجة' : 'Processing') :
                       order.status === 'shipped' ? (language === 'ar' ? 'تم الشحن' : 'Shipped') :
                       order.status === 'delivered' ? (language === 'ar' ? 'تم التسليم' : 'Delivered') :
                       order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommended Products - Customer only */}
        {user.role === 'customer' && dashboardData?.stats?.recommendedProducts && dashboardData.stats.recommendedProducts.length > 0 && (
          <div className="bg-white rounded-3xl p-6 shadow-lg mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-black flex items-center gap-2">
                <Star className="text-primary" size={24} fill="currentColor" />
                {language === 'ar' ? 'منتجات موصى بها' : 'Recommended Products'}
              </h2>
              <button
                onClick={() => onNavigate('shop')}
                className="text-primary hover:text-secondary font-bold text-sm flex items-center gap-1"
              >
                {language === 'ar' ? 'عرض الكل' : 'View All'}
                <ArrowRight size={16} />
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {dashboardData.stats.recommendedProducts.map((product) => {
                // Format image URL
                let imageUrl = product.image_url || '';
                if (imageUrl && !imageUrl.startsWith('http') && imageUrl.startsWith('/')) {
                  imageUrl = `${import.meta.env.VITE_API_URL || 'https://kingofmuscles.metacodecx.com'}${imageUrl}`;
                }
                
                const productData = {
                  id: product.id.toString(),
                  nameAr: product.name_ar || product.name,
                  nameEn: product.name_en || product.name,
                  name: product.name,
                  price: product.price,
                  oldPrice: product.old_price,
                  image: imageUrl,
                  rating: product.rating || 0,
                  reviewsCount: product.reviews_count || 0,
                  slug: product.slug,
                  flavor: [] as string[]
                };
                return (
                  <ProductCard
                    key={product.id}
                    product={productData}
                    onClick={(id) => onNavigate('product', { id })}
                    onAddToCart={(e, p) => addToCart(p, 1, p.flavor?.[0] || '')}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-3xl p-8 shadow-lg">
          <h2 className="text-2xl font-black mb-6">{language === 'ar' ? 'إجراءات سريعة' : 'Quick Actions'}</h2>
          {user.role === 'customer' ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => onNavigate('shop')}
                className="bg-primary text-white p-6 rounded-2xl font-bold hover:bg-secondary transition-all flex flex-col items-center gap-2"
              >
                <Package size={24} />
                {language === 'ar' ? 'تصفح المنتجات' : 'Browse Products'}
              </button>
              <button
                onClick={() => onNavigate('cart')}
                className="bg-accent text-primary p-6 rounded-2xl font-bold hover:bg-gray-100 transition-all flex flex-col items-center gap-2"
              >
                <ShoppingBag size={24} />
                {language === 'ar' ? 'سلة التسوق' : 'Shopping Cart'}
              </button>
              <button
                onClick={() => onNavigate('newarrivals')}
                className="bg-green-50 hover:bg-green-100 text-green-700 p-6 rounded-2xl font-bold transition-all flex flex-col items-center gap-2"
              >
                <Star size={24} />
                {language === 'ar' ? 'وصل حديثاً' : 'New Arrivals'}
              </button>
              <button
                onClick={() => onNavigate('bestsellers')}
                className="bg-orange-50 hover:bg-orange-100 text-orange-700 p-6 rounded-2xl font-bold transition-all flex flex-col items-center gap-2"
              >
                <Truck size={24} />
                {language === 'ar' ? 'الأكثر مبيعاً' : 'Best Sellers'}
              </button>
            </div>
          ) : user.role === 'employee' && dashboardData?.permissions ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {dashboardData.permissions.find((p: any) => p.permission_type === 'users' && p.can_view) && (
                <button
                  onClick={() => onNavigate('admin-dashboard', { tab: 'users' })}
                  className="bg-blue-50 hover:bg-blue-100 text-blue-700 p-6 rounded-2xl font-bold transition-all flex flex-col items-center gap-2"
                >
                  <User size={24} />
                  {language === 'ar' ? 'إدارة المستخدمين' : 'Manage Users'}
                </button>
              )}
              {dashboardData.permissions.find((p: any) => p.permission_type === 'categories' && p.can_view) && (
                <button
                  onClick={() => onNavigate('admin-dashboard', { tab: 'categories' })}
                  className="bg-orange-50 hover:bg-orange-100 text-orange-700 p-6 rounded-2xl font-bold transition-all flex flex-col items-center gap-2"
                >
                  <FolderTree size={24} />
                  {language === 'ar' ? 'إدارة الأقسام' : 'Manage Categories'}
                </button>
              )}
              {dashboardData.permissions.find((p: any) => p.permission_type === 'products' && p.can_view) && (
                <button
                  onClick={() => onNavigate('admin-dashboard', { tab: 'products' })}
                  className="bg-green-50 hover:bg-green-100 text-green-700 p-6 rounded-2xl font-bold transition-all flex flex-col items-center gap-2"
                >
                  <Package size={24} />
                  {language === 'ar' ? 'إدارة المنتجات' : 'Manage Products'}
                </button>
              )}
              {dashboardData.permissions.find((p: any) => p.permission_type === 'orders' && p.can_view) && (
                <button
                  onClick={() => onNavigate('admin-dashboard', { tab: 'orders' })}
                  className="bg-purple-50 hover:bg-purple-100 text-purple-700 p-6 rounded-2xl font-bold transition-all flex flex-col items-center gap-2"
                >
                  <ShoppingBag size={24} />
                  {language === 'ar' ? 'إدارة الطلبات' : 'Manage Orders'}
                </button>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;