import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ordersAPI } from '../utils/api';
import { Search, Eye, Package, Loader2, Calendar, User, Phone, MapPin, CreditCard, ChevronLeft, ChevronRight, TrendingUp, DollarSign, ShoppingBag, BarChart3, PieChart } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, LineChart, Line } from 'recharts';

interface AdminOrdersProps {
  onNavigate: (page: string, params?: any) => void;
}

interface Order {
  id: number;
  user_id: number | null;
  user_name: string | null;
  user_email: string | null;
  guest_name: string | null;
  guest_email: string | null;
  phone: string;
  governorate: string | null;
  city: string | null;
  shipping_address: string | null;
  total_amount: number;
  payment_method: string | null;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  notes: string | null;
  created_at: string;
  updated_at: string;
  items_count: number;
  calculated_total: number;
}

interface OrderStats {
  statusCounts: Record<string, number>;
  totalRevenue: number;
  totalOrders: number;
  dailyOrders: Array<{ date: string; count: number; revenue: number }>;
  paymentMethods: Array<{ method: string; count: number }>;
}

const AdminOrders: React.FC<AdminOrdersProps> = ({ onNavigate }) => {
  const { t, language } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter, searchTerm]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: any = {
        page: page.toString(),
        limit: '20',
        include_stats: 'true' // Request stats
      };
      
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      const response = await ordersAPI.getAllOrders(params);
      
      if (response.success && response.data) {
        setOrders(response.data.orders || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
        
        // Set stats if available
        if (response.data.stats) {
          setStats(response.data.stats);
        }
      } else {
        setError(language === 'ar' ? 'فشل تحميل الطلبات' : 'Failed to load orders');
      }
    } catch (err) {
      console.error('Fetch orders error:', err);
      setError(err instanceof Error ? err.message : (language === 'ar' ? 'حدث خطأ أثناء تحميل الطلبات' : 'An error occurred while loading orders'));
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetails = async (orderId: number) => {
    try {
      setLoadingDetails(true);
      const response = await ordersAPI.getOrderById(orderId);
      
      if (response.success && response.data) {
        setOrderItems(response.data.order.items || []);
      }
    } catch (err) {
      console.error('Fetch order details error:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleViewDetails = async (order: Order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
    await fetchOrderDetails(order.id);
  };

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      const response = await ordersAPI.updateOrderStatus(orderId, newStatus);
      
      if (response.success) {
        fetchOrders(); // Refresh orders list
      } else {
        alert(response.message || (language === 'ar' ? 'فشل تحديث حالة الطلب' : 'Failed to update order status'));
      }
    } catch (err) {
      console.error('Update status error:', err);
      alert(err instanceof Error ? err.message : (language === 'ar' ? 'حدث خطأ أثناء تحديث حالة الطلب' : 'An error occurred while updating order status'));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, { ar: string; en: string }> = {
      pending: { ar: 'قيد الانتظار', en: 'Pending' },
      processing: { ar: 'قيد المعالجة', en: 'Processing' },
      shipped: { ar: 'تم الشحن', en: 'Shipped' },
      delivered: { ar: 'تم التسليم', en: 'Delivered' },
      cancelled: { ar: 'ملغي', en: 'Cancelled' }
    };
    return labels[status] || { ar: status, en: status };
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateShort = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  // Prepare chart data
  const statusChartData = stats ? Object.entries(stats.statusCounts).map(([status, count]) => ({
    name: getStatusLabel(status)[language],
    value: count,
    status
  })) : [];

  const paymentChartData = stats?.paymentMethods.map(item => ({
    name: item.method === 'cash_on_delivery' 
      ? (language === 'ar' ? 'نقداً عند الاستلام' : 'Cash on Delivery')
      : item.method === 'vodafone_cash'
      ? 'Vodafone Cash'
      : item.method === 'instapay'
      ? 'InstaPay'
      : item.method,
    value: item.count
  })) || [];

  const COLORS = ['#ef4444', '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'];

  if (loading && orders.length === 0) {
    return (
      <div className="flex justify-center items-center py-32">
        <Loader2 className="animate-spin h-12 w-12 text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black italic uppercase mb-2">{t('orderManagement')}</h2>
          <p className="text-gray-500 text-sm font-bold">{t('manageAllOrders')}</p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <ShoppingBag className="text-white/80" size={32} />
              <TrendingUp size={24} className="text-white/60" />
            </div>
            <h3 className="text-white/80 text-sm font-bold mb-1">{language === 'ar' ? 'إجمالي الطلبات' : 'Total Orders'}</h3>
            <p className="text-4xl font-black">{stats.totalOrders}</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="text-white/80" size={32} />
              <TrendingUp size={24} className="text-white/60" />
            </div>
            <h3 className="text-white/80 text-sm font-bold mb-1">{language === 'ar' ? 'إجمالي الإيرادات' : 'Total Revenue'}</h3>
            <p className="text-4xl font-black">{stats.totalRevenue.toFixed(2)} {language === 'ar' ? 'ج.م' : 'EGP'}</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <Package className="text-white/80" size={32} />
              <BarChart3 size={24} className="text-white/60" />
            </div>
            <h3 className="text-white/80 text-sm font-bold mb-1">{language === 'ar' ? 'متوسط قيمة الطلب' : 'Average Order Value'}</h3>
            <p className="text-4xl font-black">
              {stats.totalOrders > 0 ? (stats.totalRevenue / stats.totalOrders).toFixed(2) : '0.00'} {language === 'ar' ? 'ج.م' : 'EGP'}
            </p>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <Calendar className="text-white/80" size={32} />
              <TrendingUp size={24} className="text-white/60" />
            </div>
            <h3 className="text-white/80 text-sm font-bold mb-1">{language === 'ar' ? 'طلبات اليوم' : 'Today Orders'}</h3>
            <p className="text-4xl font-black">
              {stats.dailyOrders.length > 0 
                ? stats.dailyOrders[stats.dailyOrders.length - 1]?.count || 0 
                : 0}
            </p>
          </div>
        </div>
      )}

      {/* Charts Section */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Orders by Status Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-xl font-black mb-6 flex items-center gap-2">
              <PieChart size={24} className="text-primary" />
              {language === 'ar' ? 'الطلبات حسب الحالة' : 'Orders by Status'}
            </h3>
            {statusChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Tooltip />
                  <Legend />
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </RechartsPieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-400">
                <p>{language === 'ar' ? 'لا توجد بيانات' : 'No data'}</p>
              </div>
            )}
          </div>

          {/* Daily Orders Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-xl font-black mb-6 flex items-center gap-2">
              <BarChart3 size={24} className="text-primary" />
              {language === 'ar' ? 'الطلبات خلال آخر 7 أيام' : 'Orders Last 7 Days'}
            </h3>
            {stats.dailyOrders.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.dailyOrders.map(item => ({
                  date: formatDateShort(item.date),
                  orders: item.count,
                  revenue: item.revenue
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="orders" fill="#3b82f6" name={language === 'ar' ? 'عدد الطلبات' : 'Orders'} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-400">
                <p>{language === 'ar' ? 'لا توجد بيانات' : 'No data'}</p>
              </div>
            )}
          </div>

          {/* Payment Methods Chart */}
          {paymentChartData.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                <CreditCard size={24} className="text-primary" />
                {language === 'ar' ? 'طرق الدفع' : 'Payment Methods'}
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={paymentChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#10b981" name={language === 'ar' ? 'عدد الطلبات' : 'Orders'} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Revenue Chart */}
          {stats.dailyOrders.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                <TrendingUp size={24} className="text-primary" />
                {language === 'ar' ? 'الإيرادات خلال آخر 7 أيام' : 'Revenue Last 7 Days'}
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.dailyOrders.map(item => ({
                  date: formatDateShort(item.date),
                  revenue: item.revenue
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `${value.toFixed(2)} ${language === 'ar' ? 'ج.م' : 'EGP'}`} />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} name={language === 'ar' ? 'الإيرادات' : 'Revenue'} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder={language === 'ar' ? 'ابحث عن طلب...' : 'Search orders...'}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-accent px-4 py-3 pr-12 rounded-xl outline-none border-2 border-transparent focus:border-primary font-bold"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="md:w-48">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full bg-accent px-4 py-3 rounded-xl outline-none border-2 border-transparent focus:border-primary font-bold"
            >
              <option value="all">{language === 'ar' ? 'جميع الحالات' : 'All Statuses'}</option>
              <option value="pending">{language === 'ar' ? 'قيد الانتظار' : 'Pending'}</option>
              <option value="processing">{language === 'ar' ? 'قيد المعالجة' : 'Processing'}</option>
              <option value="shipped">{language === 'ar' ? 'تم الشحن' : 'Shipped'}</option>
              <option value="delivered">{language === 'ar' ? 'تم التسليم' : 'Delivered'}</option>
              <option value="cancelled">{language === 'ar' ? 'ملغي' : 'Cancelled'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-800 font-bold">{error}</p>
        </div>
      )}

      {/* Orders Table */}
      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
          <Package className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-500 font-bold">{language === 'ar' ? 'لا توجد طلبات' : 'No orders found'}</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-right text-sm font-black uppercase text-gray-700">{language === 'ar' ? 'رقم الطلب' : 'Order ID'}</th>
                  <th className="px-6 py-4 text-right text-sm font-black uppercase text-gray-700">{language === 'ar' ? 'العميل' : 'Customer'}</th>
                  <th className="px-6 py-4 text-right text-sm font-black uppercase text-gray-700">{language === 'ar' ? 'المبلغ' : 'Amount'}</th>
                  <th className="px-6 py-4 text-right text-sm font-black uppercase text-gray-700">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                  <th className="px-6 py-4 text-right text-sm font-black uppercase text-gray-700">{language === 'ar' ? 'التاريخ' : 'Date'}</th>
                  <th className="px-6 py-4 text-right text-sm font-black uppercase text-gray-700">{language === 'ar' ? 'الإجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-black text-primary">#{order.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold">{order.user_name || order.guest_name || '-'}</p>
                        <p className="text-sm text-gray-500">{order.user_email || order.guest_email || order.phone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-black text-lg">{order.total_amount} {language === 'ar' ? 'ج.م' : 'EGP'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`px-3 py-1 rounded-lg text-sm font-bold border-0 ${getStatusColor(order.status)}`}
                      >
                        <option value="pending">{language === 'ar' ? 'قيد الانتظار' : 'Pending'}</option>
                        <option value="processing">{language === 'ar' ? 'قيد المعالجة' : 'Processing'}</option>
                        <option value="shipped">{language === 'ar' ? 'تم الشحن' : 'Shipped'}</option>
                        <option value="delivered">{language === 'ar' ? 'تم التسليم' : 'Delivered'}</option>
                        <option value="cancelled">{language === 'ar' ? 'ملغي' : 'Cancelled'}</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">{formatDate(order.created_at)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewDetails(order)}
                        className="bg-primary hover:bg-secondary text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all"
                      >
                        <Eye size={16} />
                        {language === 'ar' ? 'عرض' : 'View'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={20} />
                {language === 'ar' ? 'السابق' : 'Previous'}
              </button>
              <span className="text-gray-600 font-bold">
                {language === 'ar' ? 'صفحة' : 'Page'} {page} {language === 'ar' ? 'من' : 'of'} {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {language === 'ar' ? 'التالي' : 'Next'}
                <ChevronLeft size={20} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-black italic uppercase mb-2">
                    {language === 'ar' ? 'تفاصيل الطلب' : 'Order Details'} #{selectedOrder.id}
                  </h3>
                  <p className="text-gray-500 text-sm">{formatDate(selectedOrder.created_at)}</p>
                </div>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedOrder(null);
                    setOrderItems([]);
                  }}
                  className="text-gray-400 hover:text-gray-600 text-3xl font-bold leading-none"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6">
                <h4 className="text-lg font-black mb-4 flex items-center gap-2">
                  <User size={20} className="text-primary" />
                  {language === 'ar' ? 'معلومات العميل' : 'Customer Information'}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">{language === 'ar' ? 'الاسم' : 'Name'}</p>
                    <p className="font-bold text-lg">{selectedOrder.user_name || selectedOrder.guest_name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">{language === 'ar' ? 'البريد الإلكتروني' : 'Email'}</p>
                    <p className="font-bold text-lg">{selectedOrder.user_email || selectedOrder.guest_email || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                      <Phone size={16} />
                      {language === 'ar' ? 'الهاتف' : 'Phone'}
                    </p>
                    <p className="font-bold text-lg">{selectedOrder.phone || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                      <MapPin size={16} />
                      {language === 'ar' ? 'العنوان' : 'Address'}
                    </p>
                    <p className="font-bold text-lg">
                      {selectedOrder.shipping_address || 
                       (selectedOrder.governorate && selectedOrder.city 
                         ? `${selectedOrder.governorate}, ${selectedOrder.city}` 
                         : '-')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="text-lg font-black mb-4 flex items-center gap-2">
                  <Package size={20} className="text-primary" />
                  {language === 'ar' ? 'المنتجات' : 'Products'} ({orderItems.length})
                </h4>
                {loadingDetails ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="animate-spin h-8 w-8 text-primary" />
                  </div>
                ) : orderItems.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">{language === 'ar' ? 'لا توجد منتجات' : 'No products'}</p>
                ) : (
                  <div className="space-y-3">
                    {orderItems.map((item, index) => (
                      <div key={index} className="bg-gray-50 rounded-xl p-4 flex justify-between items-center hover:bg-gray-100 transition-colors">
                        <div className="flex-1">
                          <p className="font-bold text-lg">{language === 'ar' ? item.name_ar || item.name : item.name_en || item.name}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {language === 'ar' ? 'الكمية' : 'Quantity'}: {item.quantity} × {item.price} {language === 'ar' ? 'ج.م' : 'EGP'}
                          </p>
                        </div>
                        <p className="font-black text-xl text-primary">
                          {item.quantity * item.price} {language === 'ar' ? 'ج.م' : 'EGP'}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Order Summary */}
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-6 border-2 border-primary/20">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xl font-bold">{language === 'ar' ? 'المجموع' : 'Total'}</span>
                  <span className="text-3xl font-black text-primary">
                    {selectedOrder.total_amount} {language === 'ar' ? 'ج.م' : 'EGP'}
                  </span>
                </div>
                {selectedOrder.payment_method && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <CreditCard size={16} />
                    <span className="font-bold">
                      {language === 'ar' ? 'طريقة الدفع' : 'Payment Method'}: {
                        selectedOrder.payment_method === 'cash_on_delivery' 
                          ? (language === 'ar' ? 'نقداً عند الاستلام' : 'Cash on Delivery')
                          : selectedOrder.payment_method === 'vodafone_cash'
                          ? 'Vodafone Cash'
                          : selectedOrder.payment_method === 'instapay'
                          ? 'InstaPay'
                          : selectedOrder.payment_method
                      }
                    </span>
                  </div>
                )}
                <div className="mt-4 pt-4 border-t border-primary/20">
                  <span className={`inline-block px-4 py-2 rounded-lg text-sm font-bold ${getStatusColor(selectedOrder.status)}`}>
                    {getStatusLabel(selectedOrder.status)[language]}
                  </span>
                </div>
                {selectedOrder.notes && (
                  <div className="mt-4 pt-4 border-t border-primary/20">
                    <p className="text-sm text-gray-600 font-bold">
                      {language === 'ar' ? 'ملاحظات' : 'Notes'}: {selectedOrder.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
