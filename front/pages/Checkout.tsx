import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { siteSettingsAPI } from '../utils/api';
import { ArrowRight, MapPin, CreditCard, Smartphone, Truck, Shield, Check, User, Phone, Mail, Clipboard, Loader2, ArrowLeft } from 'lucide-react';
import { calculateDiscountedPrice, isDiscountActive } from '../utils/discount';
import { ordersAPI } from '../utils/api';
import { useDiscount } from '../context/DiscountContext';

interface CheckoutProps {
  onNavigate: (page: string, params?: any) => void;
}

const Checkout: React.FC<CheckoutProps> = ({ onNavigate }) => {
  const { t, language } = useLanguage();
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const { customerDiscount } = useDiscount();
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [accountCreated, setAccountCreated] = useState(false);
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [siteSettings, setSiteSettings] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    governorate: '',
    cityStreet: '',
    phone: '',
    backupPhone: '',
    email: '',
    paymentMethod: 'cash_on_delivery',
    notes: ''
  });

  // Update form data when user logs in
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.name || prev.fullName,
        email: user.email || prev.email
      }));
    }
  }, [user]);

  // Calculate prices with discount
  const hasDiscount = customerDiscount && isDiscountActive(customerDiscount);
  const cartWithDiscount = cart.map(item => ({
    ...item,
    discountedPrice: calculateDiscountedPrice(item.price, customerDiscount)
  }));
  
  const subtotal = cartWithDiscount.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalPrice = cartWithDiscount.reduce((acc, item) => acc + item.discountedPrice * item.quantity, 0);
  const discountAmount = subtotal - totalPrice;

  useEffect(() => {
    // Redirect to cart if cart is empty
    if (cart.length === 0 && !orderPlaced) {
      onNavigate('cart');
    }
  }, [cart, orderPlaced, onNavigate]);

  // Fetch site settings for transfer number
  useEffect(() => {
    const fetchSiteSettings = async () => {
      try {
        const response = await siteSettingsAPI.getSiteSettings();
        if (response.success && response.data?.settings) {
          setSiteSettings(response.data.settings);
        }
      } catch (err) {
        console.error('Failed to fetch site settings:', err);
      }
    };
    fetchSiteSettings();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.fullName || !formData.governorate || !formData.cityStreet || !formData.phone) {
        setError(language === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields');
        setLoading(false);
        return;
      }

      // For guests, email is required to create account
      if (!user && !formData.email) {
        setError(language === 'ar' ? 'البريد الإلكتروني مطلوب لإنشاء حساب' : 'Email is required to create an account');
        setLoading(false);
        return;
      }

      // Prepare order items with discounted prices
      const items = cart.map(item => ({
        product_id: parseInt(item.id),
        quantity: item.quantity,
        price: hasDiscount ? calculateDiscountedPrice(item.price, customerDiscount) : item.price
      }));

      // Prepare order data
      const orderData: any = {
        items,
        total_amount: totalPrice,
        phone: formData.phone,
        governorate: formData.governorate,
        city: formData.cityStreet,
        shipping_address: `${formData.governorate}, ${formData.cityStreet}`,
        payment_method: formData.paymentMethod,
        notes: formData.notes || null
      };

      // Only include guest fields if user is not logged in
      if (!user) {
        orderData.guest_name = formData.fullName;
        orderData.guest_email = formData.email || null;
      }

      // Create order
      const response = await ordersAPI.createOrder(orderData);

      if (response.success) {
        console.log('✅ Order created successfully:', response.data);
        setOrderId(response.data.order_id);
        setAccountCreated(response.data.account_created || false);
        setTemporaryPassword(response.data.temporary_password || null);
        setOrderPlaced(true);
        clearCart();
        
        // Log for debugging
        console.log('📝 Account created:', response.data.account_created);
        console.log('🔑 Temporary password:', response.data.temporary_password);
      } else {
        setError(response.message || (language === 'ar' ? 'فشل إنشاء الطلب' : 'Failed to create order'));
      }
    } catch (err) {
      console.error('Order creation error:', err);
      setError(err instanceof Error ? err.message : (language === 'ar' ? 'حدث خطأ أثناء إنشاء الطلب' : 'An error occurred while creating the order'));
    } finally {
      setLoading(false);
    }
  };

  // Success screen
  if (orderPlaced) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-green-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
            <Check className="text-green-600" size={48} />
          </div>
          <h1 className="text-4xl font-black italic uppercase mb-4 text-primary">
            {t('orderPlacedSuccessfully')}
          </h1>
          {orderId && (
            <p className="text-xl font-bold text-gray-600 mb-8">
              {t('orderNumber')}: <span className="text-primary">#{orderId}</span>
            </p>
          )}
          <p className="text-lg text-gray-500 mb-6">
            {t('thankYouMessage')}
          </p>
          
          {/* Account Created Message */}
          {accountCreated && !user && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 mb-8 max-w-xl mx-auto">
              <h3 className="text-xl font-black text-blue-800 mb-3">
                {language === 'ar' ? '✅ تم إنشاء حسابك تلقائياً!' : '✅ Your account has been created automatically!'}
              </h3>
              <p className="text-sm text-blue-700 mb-4">
                {language === 'ar' 
                  ? `تم إنشاء حساب لك باستخدام البريد الإلكتروني: ${formData.email}`
                  : `An account has been created for you using email: ${formData.email}`
                }
              </p>
              
              {/* Show temporary password if available */}
              {temporaryPassword && (
                <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4 mb-4">
                  <p className="text-sm font-black text-yellow-800 mb-2">
                    {language === 'ar' ? '🔑 كلمة المرور المؤقتة:' : '🔑 Temporary Password:'}
                  </p>
                  <div className="bg-white border border-yellow-300 rounded-lg p-3">
                    <code className="text-lg font-black text-yellow-900 select-all">{temporaryPassword}</code>
                  </div>
                  <p className="text-xs text-yellow-700 mt-2">
                    {language === 'ar' 
                      ? '⚠️ احفظ هذه الكلمة! يمكنك استخدامها لتسجيل الدخول الآن، أو استخدم "نسيت كلمة المرور" لاحقاً'
                      : '⚠️ Save this password! You can use it to log in now, or use "Forgot Password" later'
                    }
                  </p>
                </div>
              )}
              
              <p className="text-sm text-blue-600 font-bold mb-4">
                {language === 'ar' 
                  ? '💡 يمكنك الآن تسجيل الدخول لمتابعة فواتيرك وطلباتك القادمة'
                  : '💡 You can now log in to track your invoices and future orders'
                }
              </p>
              <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => onNavigate('login', { type: 'login', email: formData.email })}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-black px-6 py-3 rounded-xl transition-all"
                >
                  {language === 'ar' ? 'تسجيل الدخول الآن' : 'Login Now'}
                </button>
                <button
                  onClick={() => onNavigate('forgot-password')}
                  className="bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-black px-6 py-3 rounded-xl transition-all"
                >
                  {language === 'ar' ? 'نسيت كلمة المرور؟' : 'Forgot Password?'}
                </button>
              </div>
            </div>
          )}
          
          <button
            onClick={() => onNavigate('home')}
            className="bg-primary hover:bg-secondary text-white font-black px-10 py-4 rounded-2xl hover:scale-105 transition-all transform"
          >
            {t('continueShopping')}
            {language === 'ar' ? <ArrowLeft className="inline ml-2" size={20} /> : <ArrowRight className="inline ml-2" size={20} />}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Account Prompt Section */}
      {!user && (
        <div className="bg-white rounded-[2rem] p-8 mb-8 border border-gray-100 shadow-sm">
          <h2 className="text-2xl font-black italic uppercase mb-6 text-center">
            {t('doYouHaveAccount')}
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
            <button
              onClick={() => onNavigate('login', { type: 'login' })}
              className="bg-primary hover:bg-secondary text-white font-black px-8 py-4 rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              <User size={20} />
              {t('login')}
            </button>
            <button
              onClick={() => onNavigate('signup', { type: 'signup' })}
              className="bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white font-black px-8 py-4 rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              <User size={20} />
              {t('createAccount')}
            </button>
          </div>
          <p className="text-sm text-gray-500 text-center mb-2">
            {t('loginToAutoFill')}
          </p>
          <p className="text-xs text-gray-400 text-center">
            {t('canCompleteWithoutLogin')}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Order Summary */}
        <div className="lg:col-span-2 space-y-6">
          {/* Billing Details Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-primary/10 p-3 rounded-xl">
                <User className="text-primary" size={24} />
              </div>
              <h2 className="text-3xl font-black italic uppercase">{t('billingDetails')}</h2>
            </div>

            <div className="space-y-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  {t('fullNameRequired')}
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder={t('enterFullName')}
                  required
                  className="w-full bg-accent px-4 py-3 rounded-xl outline-none border-2 border-transparent focus:border-primary font-bold"
                />
              </div>

              {/* Country/Region */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  {t('countryRegion')}
                </label>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={t('egypt')}
                    disabled
                    className="w-full bg-gray-100 px-4 py-3 rounded-xl outline-none border-2 border-transparent font-bold text-gray-500"
                  />
                  <input
                    type="text"
                    name="governorate"
                    value={formData.governorate}
                    onChange={handleInputChange}
                    placeholder={t('enterGovernorate')}
                    required
                    className="w-full bg-accent px-4 py-3 rounded-xl outline-none border-2 border-transparent focus:border-primary font-bold"
                  />
                </div>
              </div>

              {/* City/Street */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  {t('cityStreet')}
                </label>
                <input
                  type="text"
                  name="cityStreet"
                  value={formData.cityStreet}
                  onChange={handleInputChange}
                  placeholder={t('enterCityStreet')}
                  required
                  className="w-full bg-accent px-4 py-3 rounded-xl outline-none border-2 border-transparent focus:border-primary font-bold"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  {t('phone')}
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder={t('enterPhone')}
                  required
                  className="w-full bg-accent px-4 py-3 rounded-xl outline-none border-2 border-transparent focus:border-primary font-bold"
                />
              </div>

              {/* Backup Phone */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  {t('backupPhone')}
                </label>
                <input
                  type="tel"
                  name="backupPhone"
                  value={formData.backupPhone}
                  onChange={handleInputChange}
                  placeholder={t('enterPhone')}
                  className="w-full bg-accent px-4 py-3 rounded-xl outline-none border-2 border-transparent focus:border-primary font-bold"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  {!user ? t('email') + ' *' : t('emailOptional')}
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder={t('enterEmail')}
                  required={!user}
                  className="w-full bg-accent px-4 py-3 rounded-xl outline-none border-2 border-transparent focus:border-primary font-bold"
                />
                {!user && (
                  <p className="text-xs text-gray-500 mt-1">
                    {language === 'ar' 
                      ? 'سيتم إنشاء حساب تلقائياً باستخدام هذا البريد الإلكتروني' 
                      : 'An account will be automatically created using this email'}
                  </p>
                )}
              </div>

              {/* Order Notes */}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Clipboard className="text-primary" size={20} />
                  <label className="block text-sm font-bold text-gray-700">
                    {t('orderNotes')}
                  </label>
                </div>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder={t('enterOrderNotes')}
                  rows={4}
                  className="w-full bg-accent px-4 py-3 rounded-xl outline-none border-2 border-transparent focus:border-primary font-bold resize-none"
                />
              </div>
            </div>
          </form>
        </div>

        {/* Right Column - Order Summary & Payment */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-secondary text-white p-8 rounded-[2.5rem] shadow-2xl">
            <h3 className="text-2xl font-black italic uppercase mb-6">{t('yourOrder')}</h3>
            
            <div className="space-y-4 mb-6">
              {cart.map((item) => {
                const itemPrice = hasDiscount ? calculateDiscountedPrice(item.price, customerDiscount) : item.price;
                return (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <div className="flex-1">
                      <p className="font-bold">{language === 'ar' ? item.nameAr : item.nameEn}</p>
                      <p className="text-gray-400 text-xs">{t('quantity')}: {item.quantity}</p>
                    </div>
                    <div className="text-right ml-4">
                      {hasDiscount && itemPrice < item.price ? (
                        <>
                          <p className="font-black text-primary">{itemPrice * item.quantity} {language === 'ar' ? 'ج.م' : 'EGP'}</p>
                          <p className="text-gray-400 line-through text-xs">{item.price * item.quantity} {language === 'ar' ? 'ج.م' : 'EGP'}</p>
                        </>
                      ) : (
                        <p className="font-black text-primary">{item.price * item.quantity} {language === 'ar' ? 'ج.م' : 'EGP'}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-white/10 pt-4 space-y-3 mb-6">
              <div className="flex justify-between items-center text-gray-400 font-bold">
                <span>{t('subtotal')}:</span>
                <span className="text-white">{subtotal.toFixed(2)} {language === 'ar' ? 'ج.م' : 'EGP'}</span>
              </div>
              {hasDiscount && discountAmount > 0 && (
                <div className="flex justify-between items-center text-green-400 font-bold">
                  <span>{language === 'ar' ? `خصم ${customerDiscount?.discount_percentage}%` : `${customerDiscount?.discount_percentage}% Discount`}:</span>
                  <span className="text-green-400">-{discountAmount.toFixed(2)} {language === 'ar' ? 'ج.م' : 'EGP'}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-gray-400 font-bold">
                <span>{t('shipping')}:</span>
                <span className="text-green-400">{t('free')}</span>
              </div>
              <div className="border-t border-white/10 pt-3 flex justify-between items-center">
                <span className="text-xl font-black uppercase italic">{t('total')}:</span>
                <span className="text-3xl font-black text-primary italic">{totalPrice.toFixed(2)} {language === 'ar' ? 'ج.م' : 'EGP'}</span>
              </div>
            </div>
          </div>

          {/* Shipping Info */}
          <div className="bg-primary/10 border border-primary/30 rounded-[2rem] p-6">
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="text-primary" size={24} />
              <h4 className="text-xl font-black italic uppercase">{t('governorateShipping')}</h4>
            </div>
            <div className="space-y-2 text-sm font-bold text-gray-700">
              <p>{t('advancePayment')}</p>
              <p>{t('transferNumber')} {siteSettings?.transfer_number || '03000000000'}</p>
              <p>{t('sendTransferOnWhatsapp')}</p>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <CreditCard className="text-primary" size={24} />
              <h3 className="text-2xl font-black italic uppercase">{t('paymentMethod')}</h3>
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl border-2 border-gray-200 hover:border-primary transition-all">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash_on_delivery"
                  checked={formData.paymentMethod === 'cash_on_delivery'}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-primary"
                />
                <span className="font-bold">{t('cashOnDelivery')}</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl border-2 border-gray-200 hover:border-primary transition-all">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="vodafone_cash"
                  checked={formData.paymentMethod === 'vodafone_cash'}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-primary"
                />
                <span className="font-bold">{t('vodafoneCash')}</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl border-2 border-gray-200 hover:border-primary transition-all">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="instapay"
                  checked={formData.paymentMethod === 'instapay'}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-primary"
                />
                <span className="font-bold">{t('instapay')}</span>
              </label>
            </div>

            {formData.paymentMethod !== 'cash_on_delivery' && (
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm font-bold text-blue-800 mb-2">{t('advancePayment')}</p>
                {formData.paymentMethod === 'vodafone_cash' && siteSettings?.fawrycash_number && (
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-blue-700">
                      {language === 'ar' ? 'رقم فودافون كاش:' : 'Vodafone Cash Number:'}
                    </p>
                    <p className="text-lg font-black text-blue-900" dir="ltr">{siteSettings.fawrycash_number}</p>
                    <p className="text-xs text-blue-600 mt-2">{t('sendTransferOnWhatsapp')}</p>
                  </div>
                )}
                {formData.paymentMethod === 'instapay' && siteSettings?.instapay_number && (
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-blue-700">
                      {language === 'ar' ? 'رقم انستا باي:' : 'InstaPay Number:'}
                    </p>
                    <p className="text-lg font-black text-blue-900" dir="ltr">{siteSettings.instapay_number}</p>
                    <p className="text-xs text-blue-600 mt-2">{t('sendTransferOnWhatsapp')}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-sm font-bold text-red-800">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-primary hover:bg-secondary text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all transform active:scale-95 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                {language === 'ar' ? 'جاري المعالجة...' : 'Processing...'}
              </>
            ) : (
              <>
                {t('confirmOrder')}
                {language === 'ar' ? <ArrowLeft size={20} /> : <ArrowRight size={20} />}
              </>
            )}
          </button>

          {/* Privacy Policy */}
          <p className="text-xs text-gray-500 text-center">
            {t('privacyPolicyText')} <a href="#" className="text-primary hover:underline">{t('privacyPolicy')}</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
