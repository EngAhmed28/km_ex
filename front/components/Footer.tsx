
import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Facebook, Instagram, Twitter, Youtube, MapPin, Phone, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  const { t, language } = useLanguage();

  return (
    <footer className="bg-secondary text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Brand Info */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-primary text-white p-2 rounded-lg font-black text-2xl">KM</div>
              <div>
                <p className="font-extrabold text-xl leading-none">KING OF</p>
                <p className="font-extrabold text-xl leading-none text-primary">MUSCLES</p>
              </div>
            </div>
            <p className="text-gray-400 leading-relaxed text-sm mb-6">
              {t('footerAbout')}
            </p>
            <div className="flex gap-4">
              {[Facebook, Instagram, Twitter, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary transition-all">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-6 border-b border-primary/30 pb-2 inline-block">{t('shop')}</h3>
            <ul className="space-y-4 text-gray-400 text-sm">
              <li className="hover:text-primary transition-colors cursor-pointer">{t('bestSellers')}</li>
              <li className="hover:text-primary transition-colors cursor-pointer">{t('newArrivals')}</li>
              <li className="hover:text-primary transition-colors cursor-pointer">{t('categories')}</li>
              <li className="hover:text-primary transition-colors cursor-pointer">{t('specialOffers')}</li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-bold mb-6 border-b border-primary/30 pb-2 inline-block">{t('support')}</h3>
            <ul className="space-y-4 text-gray-400 text-sm">
              <li className="hover:text-primary transition-colors cursor-pointer">{t('faqs')}</li>
              <li className="hover:text-primary transition-colors cursor-pointer">{t('returnPolicy')}</li>
              <li className="hover:text-primary transition-colors cursor-pointer">{t('shippingDelivery')}</li>
              <li className="hover:text-primary transition-colors cursor-pointer">{t('contactUs')}</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold mb-6 border-b border-primary/30 pb-2 inline-block">{t('connectWithUs')}</h3>
            <ul className="space-y-4 text-gray-400 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="text-primary mt-1 shrink-0" size={18} />
                <span>{t('address')}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="text-primary shrink-0" size={18} />
                <span dir="ltr">+966 50 123 4567</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="text-primary shrink-0" size={18} />
                <span>info@kingofmuscles.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>{t('rights')}</p>
          <div className="flex gap-4 items-center">
            <img 
              src="https://logo.clearbit.com/visa.com" 
              alt="Visa" 
              className="h-6 grayscale hover:grayscale-0 transition-all opacity-50"
              onError={(e) => { e.currentTarget.src = "https://www.google.com/s2/favicons?sz=64&domain=visa.com"; }}
            />
            <img 
              src="https://logo.clearbit.com/mastercard.com" 
              alt="Mastercard" 
              className="h-8 grayscale hover:grayscale-0 transition-all opacity-50"
              onError={(e) => { e.currentTarget.src = "https://www.google.com/s2/favicons?sz=64&domain=mastercard.com"; }}
            />
            <img 
              src="https://logo.clearbit.com/paypal.com" 
              alt="Paypal" 
              className="h-5 grayscale hover:grayscale-0 transition-all opacity-50"
              onError={(e) => { e.currentTarget.src = "https://www.google.com/s2/favicons?sz=64&domain=paypal.com"; }}
            />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
