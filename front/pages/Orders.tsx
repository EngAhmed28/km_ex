import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ordersAPI } from '../utils/api';
import { ShoppingBag, Clock, CheckCircle, Truck, Package, ArrowLeft, Eye } from 'lucide-react';

interface OrdersProps {
  onNavigate: (page: string, params?: any) => void;
}

interface Order {
  id: number;
  total_amount: number;
  status: string;
  created_at: string;
  payment_method?: string;
  items?: Array<{
    product_id: number;
    product_name: string;
    quantity: number;
    price: number;
  }>;
}

const Orders: React.FC<OrdersProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await ordersAPI.getUserOrders();
      if (response.success && response.data && response.data.orders) {
        // Convert total_amount to number
        const formattedOrders = response.data.orders.map((order: any) => ({
          ...order,
          total_amount: parseFloat(order.total_amount || 0)
        }));
        setOrders(formattedOrders);
      } else {
        setError(response.message || (language === 'ar' ? 'فشل تحميل الطلبات' : 'Failed to load orders'));
      }
    } catch (err: any) {
      setError(err.message || (language === 'ar' ? 'حدث خطأ أثناء تحميل الطلبات' : 'Error loading orders'));
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: { ar: string; en: string } } = {
      pending: { ar: 'قيد الانتظار', en: 'Pending' },
      processing: { ar: 'قيد المعالجة', en: 'Processing' },
      shipped: { ar: 'تم الشحن', en: 'Shipped' },
      delivered: { ar: 'تم التسليم', en: 'Delivered' },
      cancelled: { ar: 'ملغي', en: 'Cancelled' }
    };
    return labels[status] ? labels[status][language] : status;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock size={20} />;
      case 'processing':
        return <Package size={20} />;
      case 'shipped':
        return <Truck size={20} />;
      case 'delivered':
        return <CheckCircle size={20} />;
      default:
        return <ShoppingBag size={20} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl font-bold">{language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-3xl p-6 mb-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => onNavigate('dashboard')}
                className="bg-gray-100 hover:bg-gray-200 p-2 rounded-xl transition-all"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-3xl font-black mb-2 flex items-center gap-2">
                  <ShoppingBag className="text-primary" size={28} />
                  {language === 'ar' ? 'طلباتي' : 'My Orders'}
                </h1>
                <p className="text-gray-500 font-bold">
                  {language === 'ar' ? `إجمالي الطلبات: ${orders.length}` : `Total Orders: ${orders.length}`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 font-bold border border-red-100">
            {error}
          </div>
        )}

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 shadow-lg text-center">
            <ShoppingBag className="mx-auto text-gray-300 mb-4" size={64} />
            <h3 className="text-2xl font-black mb-2">{language === 'ar' ? 'لا توجد طلبات' : 'No Orders'}</h3>
            <p className="text-gray-500 font-bold mb-6">
              {language === 'ar' ? 'لم تقم بأي طلبات حتى الآن' : "You haven't placed any orders yet"}
            </p>
            <button
              onClick={() => onNavigate('shop')}
              className="bg-primary text-white px-6 py-3 rounded-2xl font-bold hover:bg-secondary transition-all"
            >
              {language === 'ar' ? 'تصفح المنتجات' : 'Browse Products'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="bg-primary/10 p-4 rounded-xl">
                      {getStatusIcon(order.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="text-xl font-black">#{order.id}</h3>
                        <span className={`text-xs px-3 py-1 rounded-lg font-bold ${getStatusColor(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mb-1">
                        {new Date(order.created_at).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      {order.payment_method && (
                        <p className="text-sm text-gray-500">
                          {language === 'ar' ? 'طريقة الدفع:' : 'Payment:'} {order.payment_method}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-left ml-4">
                    <p className="text-2xl font-black text-primary mb-2">
                      {order.total_amount.toFixed(2)} {language === 'ar' ? 'ج.م' : 'EGP'}
                    </p>
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2"
                    >
                      <Eye size={16} />
                      {language === 'ar' ? 'التفاصيل' : 'Details'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black">
                {language === 'ar' ? `تفاصيل الطلب #${selectedOrder.id}` : `Order #${selectedOrder.id} Details`}
              </h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="bg-gray-100 hover:bg-gray-200 p-2 rounded-xl transition-all"
              >
                <ArrowLeft size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500 mb-1">{language === 'ar' ? 'الحالة' : 'Status'}</p>
                <span className={`text-sm px-3 py-1 rounded-lg font-bold ${getStatusColor(selectedOrder.status)}`}>
                  {getStatusLabel(selectedOrder.status)}
                </span>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500 mb-1">{language === 'ar' ? 'التاريخ' : 'Date'}</p>
                <p className="font-bold">
                  {new Date(selectedOrder.created_at).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>

              {selectedOrder.payment_method && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-1">{language === 'ar' ? 'طريقة الدفع' : 'Payment Method'}</p>
                  <p className="font-bold">{selectedOrder.payment_method}</p>
                </div>
              )}

              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500 mb-1">{language === 'ar' ? 'المبلغ الإجمالي' : 'Total Amount'}</p>
                <p className="text-2xl font-black text-primary">
                  {selectedOrder.total_amount.toFixed(2)} {language === 'ar' ? 'ج.م' : 'EGP'}
                </p>
              </div>

              {selectedOrder.items && selectedOrder.items.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-3 font-bold">{language === 'ar' ? 'المنتجات' : 'Products'}</p>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-white rounded-lg">
                        <div>
                          <p className="font-bold">{item.product_name}</p>
                          <p className="text-sm text-gray-500">
                            {language === 'ar' ? 'الكمية:' : 'Quantity:'} {item.quantity}
                          </p>
                        </div>
                        <p className="font-black text-primary">
                          {(item.price * item.quantity).toFixed(2)} {language === 'ar' ? 'ج.م' : 'EGP'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6">
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full bg-primary text-white py-3 rounded-2xl font-bold hover:bg-secondary transition-all"
              >
                {language === 'ar' ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
