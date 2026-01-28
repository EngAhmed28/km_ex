
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { siteSettingsAPI } from '../utils/api';
import { Facebook, Instagram, Twitter, Youtube, MapPin, Phone, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  const { t, language } = useLanguage();
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await siteSettingsAPI.getSiteSettings();
      if (response.success && response.data?.settings) {
        setSettings(response.data.settings);
      }
    } catch (err) {
      console.error('Failed to fetch site settings:', err);
    }
  };

  if (!settings) {
    // Fallback to default values while loading
    return (
      <footer className="bg-secondary text-white pt-16 pb-8">
        <div className="container mx-auto px-4">
          <div className="text-center text-gray-400">{t('loading')}</div>
        </div>
      </footer>
    );
  }

  const siteName = language === 'ar' ? settings.site_name_ar : settings.site_name_en;
  const footerDescription = language === 'ar' ? settings.footer_description_ar : settings.footer_description_en;
  const address = language === 'ar' ? settings.address_ar : settings.address_en;

  const socialLinks = [
    { Icon: Facebook, url: settings.facebook_url },
    { Icon: Instagram, url: settings.instagram_url },
    { Icon: Twitter, url: settings.twitter_url },
    { Icon: Youtube, url: settings.youtube_url }
  ].filter(link => link.url);

  return (
    <footer className="bg-secondary text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Brand Info */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-primary text-white p-3 rounded-lg font-black text-3xl">KM</div>
              <div>
                <p className="font-extrabold text-2xl leading-none">{siteName.split(' ').slice(0, -1).join(' ')}</p>
                <p className="font-extrabold text-2xl leading-none text-primary">{siteName.split(' ').slice(-1).join(' ')}</p>
              </div>
            </div>
            <p className="text-gray-400 leading-relaxed text-sm mb-6">
              {footerDescription || t('footerAbout')}
            </p>
            {socialLinks.length > 0 && (
              <div className="flex gap-4">
                {socialLinks.map(({ Icon, url }, i) => (
                  <a 
                    key={i} 
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary transition-all"
                  >
                    <Icon size={18} />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Quick Links */}
          {settings.shop_links && settings.shop_links.length > 0 && (
            <div>
              <h3 className="text-lg font-bold mb-6 border-b border-primary/30 pb-2 inline-block">{t('shop')}</h3>
              <ul className="space-y-4 text-gray-400 text-sm">
                {settings.shop_links.map((link: any, index: number) => (
                  <li key={index}>
                    <a 
                      href={link.url || '#'} 
                      className="hover:text-primary transition-colors cursor-pointer"
                    >
                      {language === 'ar' ? link.label_ar : link.label_en}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Support */}
          {settings.support_links && settings.support_links.length > 0 && (
            <div>
              <h3 className="text-lg font-bold mb-6 border-b border-primary/30 pb-2 inline-block">{t('support')}</h3>
              <ul className="space-y-4 text-gray-400 text-sm">
                {settings.support_links.map((link: any, index: number) => (
                  <li key={index}>
                    <a 
                      href={link.url || '#'} 
                      className="hover:text-primary transition-colors cursor-pointer"
                    >
                      {language === 'ar' ? link.label_ar : link.label_en}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold mb-6 border-b border-primary/30 pb-2 inline-block">{t('connectWithUs')}</h3>
            <ul className="space-y-4 text-gray-400 text-sm">
              {address && (
                <li className="flex items-start gap-3">
                  <MapPin className="text-primary mt-1 shrink-0" size={18} />
                  <span>{address}</span>
                </li>
              )}
              {settings.phone && (
                <li className="flex items-center gap-3">
                  <Phone className="text-primary shrink-0" size={18} />
                  <span dir="ltr">{settings.phone}</span>
                </li>
              )}
              {settings.email && (
                <li className="flex items-center gap-3">
                  <Mail className="text-primary shrink-0" size={18} />
                  <span>{settings.email}</span>
                </li>
              )}
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
