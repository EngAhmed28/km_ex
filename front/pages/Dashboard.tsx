import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI } from '../utils/api';
import { User, ShoppingBag, DollarSign, Calendar, Package, FolderTree } from 'lucide-react';
import AdminDashboard from './AdminDashboard';

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
  };
  permissions?: any[];
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { user, logout } = useAuth();
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
                  <p className="text-3xl font-black">{(dashboardData.stats.totalSpent || 0).toFixed(2)} ر.س</p>
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
                {dashboardData.stats.productsCount !== undefined && (
                  <div className="bg-white rounded-3xl p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-green-500/10 p-4 rounded-2xl">
                        <Package className="text-green-500" size={24} />
                      </div>
                    </div>
                    <h3 className="text-gray-500 text-sm font-bold mb-1">المنتجات</h3>
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
                    <h3 className="text-gray-500 text-sm font-bold mb-1">الطلبات</h3>
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
                    <h3 className="text-gray-500 text-sm font-bold mb-1">الأقسام</h3>
                    <p className="text-3xl font-black">{dashboardData.stats.categoriesCount}</p>
                  </div>
                )}
                {dashboardData.permissions && dashboardData.permissions.length > 0 && (
                  <div className="bg-white rounded-3xl p-6 shadow-lg col-span-full">
                    <h3 className="text-xl font-black mb-4">صلاحياتك</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {dashboardData.permissions.map((perm: any, idx: number) => (
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

        {/* Quick Actions */}
        <div className="bg-white rounded-3xl p-8 shadow-lg">
          <h2 className="text-2xl font-black mb-6">إجراءات سريعة</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => onNavigate('shop')}
              className="bg-primary text-white p-6 rounded-2xl font-bold hover:bg-secondary transition-all text-right"
            >
              تصفح المنتجات
            </button>
            <button
              onClick={() => onNavigate('cart')}
              className="bg-accent text-primary p-6 rounded-2xl font-bold hover:bg-gray-100 transition-all text-right"
            >
              سلة التسوق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
