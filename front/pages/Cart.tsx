
import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { Trash2, ShoppingBag, Plus, Minus, ArrowRight, ArrowLeft } from 'lucide-react';

interface CartProps {
  onNavigate: (page: string) => void;
}

const Cart: React.FC<CartProps> = ({ onNavigate }) => {
  const { t, language } = useLanguage();
  const { cart, removeFromCart, totalPrice, updateQuantity } = useCart();

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <div className="bg-accent w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 text-gray-300">
          <ShoppingBag size={48} />
        </div>
        <h2 className="text-3xl font-black mb-4 uppercase italic">{t('emptyCart')}</h2>
        <button 
          onClick={() => onNavigate('shop')}
          className="bg-primary text-white font-black px-10 py-4 rounded-2xl hover:bg-secondary transition-all"
        >
          {t('shopNow')}
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-black italic uppercase mb-12 border-b-4 border-primary pb-2 w-fit">{t('cart')}</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          {cart.map((item) => (
            <div key={`${item.id}`} className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center gap-6 group">
              <div className="bg-accent p-4 rounded-2xl w-32 aspect-square flex items-center justify-center">
                <img src={item.image} className="w-full h-full object-contain" alt={item.nameEn} />
              </div>
              
              <div className="flex-grow space-y-2 text-center sm:text-right">
                <h3 className="font-black text-xl italic uppercase group-hover:text-primary transition-colors">
                  {language === 'ar' ? item.nameAr : item.nameEn}
                </h3>
                <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                  <span>{t('weight')}: <span className="text-secondary">{item.weight}</span></span>
                </div>
                
                <div className="flex items-center justify-center sm:justify-start bg-accent rounded-xl w-fit p-1 mx-auto sm:mx-0 mt-4">
                  <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition-colors text-secondary"><Minus size={14} /></button>
                  <span className="w-10 text-center font-black">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition-colors text-secondary"><Plus size={14} /></button>
                </div>
              </div>

              <div className="flex flex-col items-center sm:items-end gap-2">
                <span className="text-2xl font-black text-primary whitespace-nowrap">{item.price * item.quantity} {language === 'ar' ? 'ج.م' : 'EGP'}</span>
                <button onClick={() => removeFromCart(item.id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={20} /></button>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <div className="bg-secondary text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
            <h3 className="text-2xl font-black italic uppercase mb-8 border-b border-white/10 pb-4">{t('orderSummary')}</h3>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center text-gray-400 font-bold">
                <span>{t('subtotal')}:</span>
                <span className="text-white">{totalPrice} {language === 'ar' ? 'ج.م' : 'EGP'}</span>
              </div>
              <div className="flex justify-between items-center text-gray-400 font-bold">
                <span>{t('shipping')}:</span>
                <span className="text-green-400">{t('free')}</span>
              </div>
              <div className="border-t border-white/10 pt-4 flex justify-between items-center">
                <span className="text-xl font-black uppercase italic">{t('total')}:</span>
                <span className="text-3xl font-black text-primary italic">{totalPrice} {language === 'ar' ? 'ج.م' : 'EGP'}</span>
              </div>
            </div>

            <button onClick={() => onNavigate('checkout')} className="w-full bg-primary hover:bg-white hover:text-primary text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all transform active:scale-95 text-lg">
              {t('checkout')}
              {language === 'ar' ? <ArrowLeft size={20} /> : <ArrowRight size={20} />}
            </button>
          </div>

          <div className="bg-accent p-6 rounded-[2rem] border border-gray-100">
            <h4 className="font-bold text-sm uppercase tracking-widest text-gray-500 mb-4">{t('discountCode')}</h4>
            <div className="flex gap-2">
              <input type="text" placeholder={t('discountCode')} className="flex-grow bg-white px-4 py-3 rounded-xl outline-none border-2 border-transparent focus:border-primary text-sm font-bold" />
              <button className="bg-secondary text-white px-6 py-3 rounded-xl font-bold text-sm">{t('apply')}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
