import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { dashboardAPI } from '../utils/api';
import { Users, ShoppingBag, Package, FolderTree, Settings, LogOut, TrendingUp, Clock, ArrowRight, Eye, Building2, BarChart3, Tag, Target } from 'lucide-react';
import AdminUsers from './AdminUsers';
import AdminCategories from './AdminCategories';
import AdminProducts from './AdminProducts';
import AdminOrders from './AdminOrders';
import AdminBrands from './AdminBrands';
import AdminStats from './AdminStats';
import AdminDeals from './AdminDeals';
import AdminGoals from './AdminGoals';

interface AdminDashboardProps {
  onNavigate: (page: string, params?: any) => void;
  initialTab?: string;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate, initialTab }) => {
  const { user, logout } = useAuth();
  const { language, t } = useLanguage();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(initialTab || (user?.role === 'admin' ? 'overview' : 'users'));

  useEffect(() => {
    // Redirect to home if user is not admin/employee or logged out
    if (!user || (user.role !== 'admin' && user.role !== 'employee')) {
      onNavigate('home');
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await dashboardAPI.getDashboard();
        console.log('AdminDashboard - Dashboard response:', response);
        console.log('AdminDashboard - Permissions:', response.data?.permissions);
        if (response.success) {
          setDashboardData(response.data);
          // Set initial tab based on permissions for employees
          if (user.role === 'employee') {
            if (initialTab) {
              setActiveTab(initialTab);
            } else if (response.data?.permissions) {
              // Set first available tab for employee based on permissions
              const perms = response.data.permissions;
              const hasPermission = (permissionType: string) => {
                const perm = perms.find((p: any) => 
                  p.permission_type === permissionType && 
                  (p.can_view === true || p.can_view === 1 || p.can_view === '1')
                );
                return !!perm;
              };
              
              if (hasPermission('users')) {
                setActiveTab('users');
              } else if (hasPermission('categories')) {
                setActiveTab('categories');
              } else if (hasPermission('products')) {
                setActiveTab('products');
              } else if (hasPermission('orders')) {
                setActiveTab('orders');
              }
            }
          }
        }
      } catch (err: any) {
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, onNavigate, initialTab]);

  if (!user || (user.role !== 'admin' && user.role !== 'employee')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-bold mb-4">{language === 'ar' ? 'جاري التوجيه...' : 'Redirecting...'}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl font-bold">{t('loading')}</div>
      </div>
    );
  }

  const stats = dashboardData?.stats || {};

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-black mb-2">{t('adminDashboard')}</h1>
              <p className="text-gray-500 font-bold">{t('welcomeAdmin')}, {user.name}</p>
            </div>
            <button
              onClick={() => {
                logout();
                onNavigate('home');
              }}
              className="bg-red-500 text-white px-6 py-3 rounded-2xl font-bold hover:bg-red-600 transition-all flex items-center gap-2"
            >
              <LogOut size={20} />
              {t('logout')}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Show stats based on role and permissions */}
          {/* Helper function to check if user has view permission */}
          {(() => {
            const hasPermission = (permissionType: string) => {
              if (user.role === 'admin') return true;
              if (!dashboardData?.permissions) return false;
              const perm = dashboardData.permissions.find((p: any) => 
                p.permission_type === permissionType && 
                (p.can_view === true || p.can_view === 1 || p.can_view === '1')
              );
              return !!perm;
            };
            
            return (
              <>
                {hasPermission('users') && (
                  <div className="bg-white rounded-3xl p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-blue-500/10 p-4 rounded-2xl">
                        <Users className="text-blue-500" size={24} />
                      </div>
                    </div>
                    <h3 className="text-gray-500 text-sm font-bold mb-1">{t('totalUsers')}</h3>
                    <p className="text-3xl font-black">{stats.totalUsers || stats.usersCount || 0}</p>
                  </div>
                )}

                {hasPermission('products') && (
                  <div className="bg-white rounded-3xl p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-green-500/10 p-4 rounded-2xl">
                        <Package className="text-green-500" size={24} />
                      </div>
                    </div>
                    <h3 className="text-gray-500 text-sm font-bold mb-1">{t('products')}</h3>
                    <p className="text-3xl font-black">{stats.totalProducts || stats.productsCount || 0}</p>
                  </div>
                )}

                {hasPermission('orders') && (
                  <div className="bg-white rounded-3xl p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-purple-500/10 p-4 rounded-2xl">
                        <ShoppingBag className="text-purple-500" size={24} />
                      </div>
                    </div>
                    <h3 className="text-gray-500 text-sm font-bold mb-1">{t('orders')}</h3>
                    <p className="text-3xl font-black">{stats.totalOrders || stats.ordersCount || 0}</p>
                  </div>
                )}

                {hasPermission('categories') && (
                  <div className="bg-white rounded-3xl p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-orange-500/10 p-4 rounded-2xl">
                        <FolderTree className="text-orange-500" size={24} />
                      </div>
                    </div>
                    <h3 className="text-gray-500 text-sm font-bold mb-1">{t('categories')}</h3>
                    <p className="text-3xl font-black">{stats.totalCategories || stats.categoriesCount || 0}</p>
                  </div>
                )}
              </>
            );
          })()}
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-3xl p-6 shadow-lg mb-6">
          <div className="flex gap-4 border-b border-gray-200 pb-4">
            {user.role === 'admin' ? (
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-3 rounded-2xl font-bold transition-all ${
                  activeTab === 'overview'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t('overview')}
              </button>
            ) : null}
            {(() => {
              const hasPermission = (permissionType: string) => {
                if (user.role === 'admin') return true;
                if (!dashboardData?.permissions) return false;
                const perm = dashboardData.permissions.find((p: any) => 
                  p.permission_type === permissionType && 
                  (p.can_view === true || p.can_view === 1 || p.can_view === '1')
                );
                return !!perm;
              };
              
              return (
                <>
                  {hasPermission('users') && (
                    <button
                      onClick={() => setActiveTab('users')}
                      className={`px-6 py-3 rounded-2xl font-bold transition-all ${
                        activeTab === 'users'
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {t('userManagement')}
                    </button>
                  )}
                  {hasPermission('categories') && (
                    <button
                      onClick={() => setActiveTab('categories')}
                      className={`px-6 py-3 rounded-2xl font-bold transition-all ${
                        activeTab === 'categories'
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {t('categoryManagement')}
                    </button>
                  )}
                  {hasPermission('products') && (
                    <button
                      onClick={() => setActiveTab('products')}
                      className={`px-6 py-3 rounded-2xl font-bold transition-all ${
                        activeTab === 'products'
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {t('productManagement')}
                    </button>
                  )}
                  {hasPermission('orders') && (
                    <button
                      onClick={() => setActiveTab('orders')}
                      className={`px-6 py-3 rounded-2xl font-bold transition-all ${
                        activeTab === 'orders'
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {t('orderManagement')}
                    </button>
                  )}
                  {user.role === 'admin' && (
                    <>
                      <button
                        onClick={() => setActiveTab('brands')}
                        className={`px-6 py-3 rounded-2xl font-bold transition-all ${
                          activeTab === 'brands'
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {language === 'ar' ? 'البراندات' : 'Brands'}
                      </button>
                      <button
                        onClick={() => setActiveTab('stats')}
                        className={`px-6 py-3 rounded-2xl font-bold transition-all ${
                          activeTab === 'stats'
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {language === 'ar' ? 'الإحصائيات' : 'Statistics'}
                      </button>
                      <button
                        onClick={() => setActiveTab('deals')}
                        className={`px-6 py-3 rounded-2xl font-bold transition-all ${
                          activeTab === 'deals'
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {language === 'ar' ? 'صفقات اليوم' : 'Deals of Day'}
                      </button>
                      <button
                        onClick={() => setActiveTab('goals')}
                        className={`px-6 py-3 rounded-2xl font-bold transition-all ${
                          activeTab === 'goals'
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {language === 'ar' ? 'الأهداف' : 'Goals'}
                      </button>
                    </>
                  )}
                </>
              );
            })()}
          </div>

          <div className="mt-6">
            {activeTab === 'overview' && user.role === 'admin' && (
              <div className="space-y-6">
                {/* Welcome Section */}
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-6 border-2 border-primary/20">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/20 p-4 rounded-xl">
                      <Settings className="text-primary" size={32} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black italic uppercase mb-1">
                        {language === 'ar' ? 'مرحباً في لوحة تحكم المدير' : 'Welcome to Admin Dashboard'}
                      </h2>
                      <p className="text-gray-600 font-bold">
                        {language === 'ar' 
                          ? `إجمالي الإيرادات: ${stats.totalRevenue?.toFixed(2) || '0.00'} ج.م`
                          : `Total Revenue: ${stats.totalRevenue?.toFixed(2) || '0.00'} EGP`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border border-yellow-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-yellow-700 font-bold mb-1">{language === 'ar' ? 'قيد الانتظار' : 'Pending'}</p>
                        <p className="text-2xl font-black text-yellow-800">{stats.ordersByStatus?.pending || 0}</p>
                      </div>
                      <Clock className="text-yellow-600" size={24} />
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-700 font-bold mb-1">{language === 'ar' ? 'قيد المعالجة' : 'Processing'}</p>
                        <p className="text-2xl font-black text-blue-800">{stats.ordersByStatus?.processing || 0}</p>
                      </div>
                      <Package className="text-blue-600" size={24} />
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-purple-700 font-bold mb-1">{language === 'ar' ? 'تم الشحن' : 'Shipped'}</p>
                        <p className="text-2xl font-black text-purple-800">{stats.ordersByStatus?.shipped || 0}</p>
                      </div>
                      <ShoppingBag className="text-purple-600" size={24} />
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-700 font-bold mb-1">{language === 'ar' ? 'تم التسليم' : 'Delivered'}</p>
                        <p className="text-2xl font-black text-green-800">{stats.ordersByStatus?.delivered || 0}</p>
                      </div>
                      <TrendingUp className="text-green-600" size={24} />
                    </div>
                  </div>
                </div>

                {/* Recent Orders and Users */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Orders */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-black flex items-center gap-2">
                        <ShoppingBag className="text-primary" size={24} />
                        {language === 'ar' ? 'آخر الطلبات' : 'Recent Orders'}
                      </h3>
                      <button
                        onClick={() => setActiveTab('orders')}
                        className="text-primary hover:text-secondary font-bold text-sm flex items-center gap-1"
                      >
                        {language === 'ar' ? 'عرض الكل' : 'View All'}
                        <ArrowRight size={16} />
                      </button>
                    </div>
                    {stats.recentOrders && stats.recentOrders.length > 0 ? (
                      <div className="space-y-3">
                        {stats.recentOrders.map((order: any) => (
                          <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                            <div>
                              <p className="font-bold">#{order.id}</p>
                              <p className="text-sm text-gray-500">{order.customer_name || order.customer_email || '-'}</p>
                            </div>
                            <div className="text-left">
                              <p className="font-black text-primary">{order.total_amount} {language === 'ar' ? 'ج.م' : 'EGP'}</p>
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
                    ) : (
                      <p className="text-gray-400 text-center py-8">{language === 'ar' ? 'لا توجد طلبات حديثة' : 'No recent orders'}</p>
                    )}
                  </div>

                  {/* Recent Users */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-black flex items-center gap-2">
                        <Users className="text-primary" size={24} />
                        {language === 'ar' ? 'آخر المستخدمين' : 'Recent Users'}
                      </h3>
                      <button
                        onClick={() => setActiveTab('users')}
                        className="text-primary hover:text-secondary font-bold text-sm flex items-center gap-1"
                      >
                        {language === 'ar' ? 'عرض الكل' : 'View All'}
                        <ArrowRight size={16} />
                      </button>
                    </div>
                    {stats.recentUsers && stats.recentUsers.length > 0 ? (
                      <div className="space-y-3">
                        {stats.recentUsers.map((user: any) => (
                          <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                            <div>
                              <p className="font-bold">{user.name}</p>
                              <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                            <div className="text-left">
                              <span className={`text-xs px-2 py-1 rounded-lg font-bold ${
                                user.role === 'admin' ? 'bg-red-100 text-red-800' :
                                user.role === 'employee' ? 'bg-blue-100 text-blue-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {user.role === 'admin' ? (language === 'ar' ? 'مدير' : 'Admin') :
                                 user.role === 'employee' ? (language === 'ar' ? 'موظف' : 'Employee') :
                                 (language === 'ar' ? 'عميل' : 'Customer')}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400 text-center py-8">{language === 'ar' ? 'لا يوجد مستخدمين جدد' : 'No recent users'}</p>
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-xl font-black mb-4">{language === 'ar' ? 'إجراءات سريعة' : 'Quick Actions'}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button
                      onClick={() => setActiveTab('users')}
                      className="bg-blue-50 hover:bg-blue-100 text-blue-700 p-4 rounded-xl font-bold transition-all flex flex-col items-center gap-2"
                    >
                      <Users size={24} />
                      {language === 'ar' ? 'إدارة المستخدمين' : 'Manage Users'}
                    </button>
                    <button
                      onClick={() => setActiveTab('categories')}
                      className="bg-orange-50 hover:bg-orange-100 text-orange-700 p-4 rounded-xl font-bold transition-all flex flex-col items-center gap-2"
                    >
                      <FolderTree size={24} />
                      {language === 'ar' ? 'إدارة الأقسام' : 'Manage Categories'}
                    </button>
                    <button
                      onClick={() => setActiveTab('products')}
                      className="bg-green-50 hover:bg-green-100 text-green-700 p-4 rounded-xl font-bold transition-all flex flex-col items-center gap-2"
                    >
                      <Package size={24} />
                      {language === 'ar' ? 'إدارة المنتجات' : 'Manage Products'}
                    </button>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="bg-purple-50 hover:bg-purple-100 text-purple-700 p-4 rounded-xl font-bold transition-all flex flex-col items-center gap-2"
                    >
                      <ShoppingBag size={24} />
                      {language === 'ar' ? 'إدارة الطلبات' : 'Manage Orders'}
                    </button>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'users' && (
              <div className="-m-6">
                <AdminUsers onNavigate={onNavigate} />
              </div>
            )}
            {activeTab === 'products' && (
              <div className="-m-6">
                <AdminProducts onNavigate={onNavigate} />
              </div>
            )}
            {activeTab === 'categories' && (
              <div className="-m-6">
                <AdminCategories onNavigate={onNavigate} />
              </div>
            )}
            {activeTab === 'orders' && (
              <div className="-m-6">
                <AdminOrders onNavigate={onNavigate} />
              </div>
            )}
            {activeTab === 'brands' && user.role === 'admin' && (
              <div className="-m-6">
                <AdminBrands onNavigate={onNavigate} />
              </div>
            )}
            {activeTab === 'stats' && user.role === 'admin' && (
              <div className="-m-6">
                <AdminStats onNavigate={onNavigate} />
              </div>
            )}
            {activeTab === 'deals' && user.role === 'admin' && (
              <div className="-m-6">
                <AdminDeals onNavigate={onNavigate} />
              </div>
            )}
            {activeTab === 'goals' && user.role === 'admin' && (
              <div className="-m-6">
                <AdminGoals onNavigate={onNavigate} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
