import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { dashboardAPI } from '../utils/api';
import { Users, ShoppingBag, Package, FolderTree, Settings, LogOut } from 'lucide-react';
import AdminUsers from './AdminUsers';
import AdminCategories from './AdminCategories';

interface AdminDashboardProps {
  onNavigate: (page: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const { user, logout } = useAuth();
  const { language, t } = useLanguage();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await dashboardAPI.getDashboard();
        if (response.success) {
          setDashboardData(response.data);
        }
      } catch (err: any) {
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role === 'admin') {
      fetchDashboardData();
    }
  }, [user]);

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-bold mb-4">{language === 'ar' ? 'ليس لديك صلاحية للوصول' : 'You do not have access permission'}</p>
          <button
            onClick={() => onNavigate('home')}
            className="bg-primary text-white px-6 py-3 rounded-2xl font-bold"
          >
            {t('home')}
          </button>
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
              onClick={logout}
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
          <div className="bg-white rounded-3xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-500/10 p-4 rounded-2xl">
                <Users className="text-blue-500" size={24} />
              </div>
            </div>
            <h3 className="text-gray-500 text-sm font-bold mb-1">{t('totalUsers')}</h3>
            <p className="text-3xl font-black">{stats.totalUsers || 0}</p>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-500/10 p-4 rounded-2xl">
                <Package className="text-green-500" size={24} />
              </div>
            </div>
            <h3 className="text-gray-500 text-sm font-bold mb-1">{t('products')}</h3>
            <p className="text-3xl font-black">{stats.totalProducts || 0}</p>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-500/10 p-4 rounded-2xl">
                <ShoppingBag className="text-purple-500" size={24} />
              </div>
            </div>
            <h3 className="text-gray-500 text-sm font-bold mb-1">{t('orders')}</h3>
            <p className="text-3xl font-black">{stats.totalOrders || 0}</p>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-500/10 p-4 rounded-2xl">
                <FolderTree className="text-orange-500" size={24} />
              </div>
            </div>
            <h3 className="text-gray-500 text-sm font-bold mb-1">{t('categories')}</h3>
            <p className="text-3xl font-black">{stats.totalCategories || 0}</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-3xl p-6 shadow-lg mb-6">
          <div className="flex gap-4 border-b border-gray-200 pb-4">
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
          </div>

          <div className="mt-6">
            {activeTab === 'overview' && (
              <div className="text-center py-12">
                <Settings size={64} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 font-bold">{language === 'ar' ? 'مرحباً في لوحة تحكم المدير' : 'Welcome to Admin Dashboard'}</p>
                <p className="text-sm text-gray-400 mt-2">{language === 'ar' ? 'اختر قسم من الأعلى للبدء' : 'Select a section from above to get started'}</p>
              </div>
            )}
            {activeTab === 'users' && (
              <div className="-m-6">
                <AdminUsers onNavigate={onNavigate} />
              </div>
            )}
            {activeTab === 'products' && (
              <div>
                <p className="text-gray-500">{language === 'ar' ? 'قسم إدارة المنتجات - قريباً' : 'Product Management - Coming Soon'}</p>
              </div>
            )}
            {activeTab === 'categories' && (
              <div className="-m-6">
                <AdminCategories onNavigate={onNavigate} />
              </div>
            )}
            {activeTab === 'orders' && (
              <div>
                <p className="text-gray-500">{language === 'ar' ? 'قسم إدارة الطلبات - قريباً' : 'Order Management - Coming Soon'}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
