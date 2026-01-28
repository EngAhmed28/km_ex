import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { siteSettingsAPI } from '../utils/api';
import { Settings, Save, Upload, Plus, Trash2, X } from 'lucide-react';

interface AdminSiteSettingsProps {
  onNavigate: (page: string) => void;
}

interface SiteSettings {
  id?: number;
  site_name_ar: string;
  site_name_en: string;
  logo_url: string | null;
  footer_description_ar: string;
  footer_description_en: string;
  facebook_url: string | null;
  instagram_url: string | null;
  twitter_url: string | null;
  youtube_url: string | null;
  address_ar: string;
  address_en: string;
  phone: string;
  email: string;
  transfer_number: string;
  shop_links: Array<{ label_ar: string; label_en: string; url: string }>;
  support_links: Array<{ label_ar: string; label_en: string; url: string }>;
}

const AdminSiteSettings: React.FC<AdminSiteSettingsProps> = ({ onNavigate }) => {
  const { user: currentUser } = useAuth();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SiteSettings>({
    site_name_ar: '',
    site_name_en: '',
    logo_url: null,
    footer_description_ar: '',
    footer_description_en: '',
    facebook_url: null,
    instagram_url: null,
    twitter_url: null,
    youtube_url: null,
    address_ar: '',
    address_en: '',
    phone: '',
    email: '',
    transfer_number: '',
    shop_links: [],
    support_links: []
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [logoError, setLogoError] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await siteSettingsAPI.getSiteSettings();
      if (response.success && response.data?.settings) {
        setSettings(response.data.settings);
        if (response.data.settings.logo_url) {
          // Format logo URL to full URL if needed
          let logoUrl = response.data.settings.logo_url;
          if (logoUrl && !logoUrl.startsWith('http') && logoUrl.startsWith('/')) {
            logoUrl = `${import.meta.env.VITE_API_URL || 'https://kingofmuscles.metacodecx.com'}${logoUrl}`;
          }
          setLogoPreview(logoUrl);
        }
      }
    } catch (err: any) {
      alert(err.message || (language === 'ar' ? 'فشل تحميل الإعدادات' : 'Failed to load settings'));
    } finally {
      setLoading(false);
    }
  };

  const handleLogoChange = (file: File | null) => {
    if (!file) {
      setLogoFile(null);
      setLogoPreview('');
      setLogoError('');
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

    if (!allowedTypes.includes(file.type)) {
      setLogoError(language === 'ar' ? 'نوع الملف غير مدعوم. يرجى اختيار صورة (JPG, PNG, WEBP, GIF)' : 'File type not supported. Please choose an image (JPG, PNG, WEBP, GIF)');
      return;
    }

    if (file.size > maxSize) {
      setLogoError(language === 'ar' ? 'حجم الصورة كبير جداً. الحد الأقصى 5 ميجابايت' : 'Image size is too large. Maximum 5MB');
      return;
    }

    setLogoFile(file);
    setLogoError('');
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result) {
        setLogoPreview(reader.result as string);
        console.log('Logo preview set successfully');
      } else {
        setLogoError(language === 'ar' ? 'فشل تحميل الصورة' : 'Failed to load image');
      }
    };
    reader.onerror = () => {
      setLogoError(language === 'ar' ? 'حدث خطأ أثناء قراءة الصورة' : 'Error reading image file');
      setLogoFile(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      console.log('Saving settings:', settings);
      let logoUrl: string | null = settings.logo_url;

      // Upload logo if new file is selected
      if (logoFile) {
        const formData = new FormData();
        formData.append('image', logoFile);

        const uploadResponse = await fetch(`${import.meta.env.VITE_API_URL || 'https://kingofmuscles.metacodecx.com/api'}/upload/logo`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        });

        if (!uploadResponse.ok) {
          throw new Error(language === 'ar' ? 'فشل رفع الصورة' : 'Failed to upload image');
        }

        const uploadData = await uploadResponse.json();
        logoUrl = uploadData.data.url;
      }

      const response = await siteSettingsAPI.updateSiteSettings({
        ...settings,
        logo_url: logoUrl,
        transfer_number: settings.transfer_number
      });

      console.log('API Response:', response);

      if (response.success) {
        console.log('Settings saved successfully');
        alert(language === 'ar' ? 'تم حفظ الإعدادات بنجاح' : 'Settings saved successfully');
        setLogoFile(null);
        // Update logo preview with the new URL
        if (logoUrl) {
          let previewUrl = logoUrl;
          if (previewUrl && !previewUrl.startsWith('http') && previewUrl.startsWith('/')) {
            previewUrl = `${import.meta.env.VITE_API_URL || 'https://kingofmuscles.metacodecx.com'}${previewUrl}`;
          }
          setLogoPreview(previewUrl);
        }
        // Update settings state
        setSettings({ ...settings, logo_url: logoUrl });
      } else {
        console.error('Save failed:', response);
        alert(response.message || (language === 'ar' ? 'فشل حفظ الإعدادات' : 'Failed to save settings'));
      }
    } catch (err: any) {
      console.error('Save error:', err);
      alert(err.message || (language === 'ar' ? 'فشل حفظ الإعدادات' : 'Failed to save settings'));
    } finally {
      setSaving(false);
    }
  };

  const addLink = (type: 'shop' | 'support') => {
    const newLink = { label_ar: '', label_en: '', url: '' };
    if (type === 'shop') {
      setSettings({ ...settings, shop_links: [...settings.shop_links, newLink] });
    } else {
      setSettings({ ...settings, support_links: [...settings.support_links, newLink] });
    }
  };

  const removeLink = (type: 'shop' | 'support', index: number) => {
    if (type === 'shop') {
      setSettings({ ...settings, shop_links: settings.shop_links.filter((_, i) => i !== index) });
    } else {
      setSettings({ ...settings, support_links: settings.support_links.filter((_, i) => i !== index) });
    }
  };

  const updateLink = (type: 'shop' | 'support', index: number, field: string, value: string) => {
    if (type === 'shop') {
      const updatedLinks = [...settings.shop_links];
      updatedLinks[index] = { ...updatedLinks[index], [field]: value };
      setSettings({ ...settings, shop_links: updatedLinks });
    } else {
      const updatedLinks = [...settings.support_links];
      updatedLinks[index] = { ...updatedLinks[index], [field]: value };
      setSettings({ ...settings, support_links: updatedLinks });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-xl font-bold">{language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-3xl p-6 mb-6 shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-black mb-2">{language === 'ar' ? 'إدارة البيانات الأساسية' : 'Site Settings'}</h1>
              <p className="text-gray-500 font-bold">{language === 'ar' ? 'إدارة اللوجو والاسم وتفاصيل الفوتر' : 'Manage logo, name, and footer details'}</p>
            </div>
            <button
              onClick={() => onNavigate('admin-dashboard')}
              className="bg-gray-100 text-gray-700 px-6 py-3 rounded-2xl font-bold hover:bg-gray-200 transition-all"
            >
              {language === 'ar' ? 'العودة' : 'Back'}
            </button>
          </div>
        </div>

        {/* Settings Form */}
        <div className="bg-white rounded-3xl p-6 shadow-lg mb-6">
          <h2 className="text-2xl font-black mb-6">{language === 'ar' ? 'معلومات الموقع الأساسية' : 'Basic Site Information'}</h2>
          
          <div className="space-y-6">
            {/* Site Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2">{language === 'ar' ? 'اسم الموقع (عربي)' : 'Site Name (Arabic)'}</label>
                <input
                  type="text"
                  value={settings.site_name_ar}
                  onChange={(e) => setSettings({ ...settings, site_name_ar: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">{language === 'ar' ? 'اسم الموقع (إنجليزي)' : 'Site Name (English)'}</label>
                <input
                  type="text"
                  value={settings.site_name_en}
                  onChange={(e) => setSettings({ ...settings, site_name_en: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* Logo */}
            <div>
              <label className="block text-sm font-bold mb-2">{language === 'ar' ? 'لوجو الموقع' : 'Site Logo'}</label>
              <div className="flex gap-4 items-start">
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                    onChange={(e) => handleLogoChange(e.target.files?.[0] || null)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
                  />
                  {logoError && (
                    <p className="text-red-500 text-sm mt-1">{logoError}</p>
                  )}
                  {settings.logo_url && !logoFile && (
                    <p className="text-gray-500 text-sm mt-2">
                      {language === 'ar' ? 'اللوجو الحالي:' : 'Current logo:'} {settings.logo_url}
                    </p>
                  )}
                </div>
                {(logoPreview || logoFile) && (
                  <div className="relative">
                    {logoPreview ? (
                      <img 
                        src={logoPreview} 
                        alt="Logo preview" 
                        className="h-20 w-20 object-contain rounded-xl border border-gray-200 bg-gray-50"
                        onLoad={() => console.log('Logo image loaded successfully:', logoPreview)}
                        onError={(e) => {
                          console.error('Failed to load logo image:', logoPreview);
                          // Show placeholder if image fails to load
                          e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Crect fill="%23e5e7eb" width="80" height="80"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="12"%3EImage%3C/text%3E%3C/svg%3E';
                        }}
                      />
                    ) : (
                      <div className="h-20 w-20 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center">
                        <span className="text-gray-400 text-xs">{language === 'ar' ? 'معاينة' : 'Preview'}</span>
                      </div>
                    )}
                    {logoFile && (
                      <button
                        onClick={() => {
                          setLogoFile(null);
                          // Restore original logo URL if exists
                          if (settings.logo_url) {
                            let logoUrl = settings.logo_url;
                            if (logoUrl && !logoUrl.startsWith('http') && logoUrl.startsWith('/')) {
                              logoUrl = `${import.meta.env.VITE_API_URL || 'https://kingofmuscles.metacodecx.com'}${logoUrl}`;
                            }
                            setLogoPreview(logoUrl);
                          } else {
                            setLogoPreview('');
                          }
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-all z-10"
                        title={language === 'ar' ? 'إلغاء التغيير' : 'Cancel change'}
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Footer Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2">{language === 'ar' ? 'وصف الفوتر (عربي)' : 'Footer Description (Arabic)'}</label>
                <textarea
                  value={settings.footer_description_ar}
                  onChange={(e) => setSettings({ ...settings, footer_description_ar: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">{language === 'ar' ? 'وصف الفوتر (إنجليزي)' : 'Footer Description (English)'}</label>
                <textarea
                  value={settings.footer_description_en}
                  onChange={(e) => setSettings({ ...settings, footer_description_en: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="bg-white rounded-3xl p-6 shadow-lg mb-6">
          <h2 className="text-2xl font-black mb-6">{language === 'ar' ? 'روابط السوشيال ميديا' : 'Social Media Links'}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2">Facebook</label>
              <input
                type="url"
                value={settings.facebook_url || ''}
                onChange={(e) => setSettings({ ...settings, facebook_url: e.target.value || null })}
                placeholder="https://facebook.com/..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Instagram</label>
              <input
                type="url"
                value={settings.instagram_url || ''}
                onChange={(e) => setSettings({ ...settings, instagram_url: e.target.value || null })}
                placeholder="https://instagram.com/..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Twitter</label>
              <input
                type="url"
                value={settings.twitter_url || ''}
                onChange={(e) => setSettings({ ...settings, twitter_url: e.target.value || null })}
                placeholder="https://twitter.com/..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">YouTube</label>
              <input
                type="url"
                value={settings.youtube_url || ''}
                onChange={(e) => setSettings({ ...settings, youtube_url: e.target.value || null })}
                placeholder="https://youtube.com/..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-3xl p-6 shadow-lg mb-6">
          <h2 className="text-2xl font-black mb-6">{language === 'ar' ? 'معلومات التواصل' : 'Contact Information'}</h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2">{language === 'ar' ? 'العنوان (عربي)' : 'Address (Arabic)'}</label>
                <input
                  type="text"
                  value={settings.address_ar}
                  onChange={(e) => setSettings({ ...settings, address_ar: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">{language === 'ar' ? 'العنوان (إنجليزي)' : 'Address (English)'}</label>
                <input
                  type="text"
                  value={settings.address_en}
                  onChange={(e) => setSettings({ ...settings, address_en: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2">{language === 'ar' ? 'رقم الهاتف' : 'Phone'}</label>
                <input
                  type="tel"
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">{language === 'ar' ? 'البريد الإلكتروني' : 'Email'}</label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">{language === 'ar' ? 'رقم التحويل' : 'Transfer Number'}</label>
              <input
                type="text"
                value={settings.transfer_number}
                onChange={(e) => setSettings({ ...settings, transfer_number: e.target.value })}
                placeholder={language === 'ar' ? '03000000000' : '03000000000'}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="bg-white rounded-3xl p-6 shadow-lg mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black">{language === 'ar' ? 'روابط المتجر' : 'Shop Links'}</h2>
            <button
              onClick={() => addLink('shop')}
              className="bg-primary text-white px-4 py-2 rounded-xl font-bold hover:bg-secondary transition-all flex items-center gap-2"
            >
              <Plus size={18} /> {language === 'ar' ? 'إضافة رابط' : 'Add Link'}
            </button>
          </div>
          
          <div className="space-y-4">
            {settings.shop_links.map((link, index) => (
              <div key={index} className="grid grid-cols-12 gap-4 items-center p-4 bg-gray-50 rounded-xl">
                <div className="col-span-4">
                  <input
                    type="text"
                    value={link.label_ar}
                    onChange={(e) => updateLink('shop', index, 'label_ar', e.target.value)}
                    placeholder={language === 'ar' ? 'النص (عربي)' : 'Label (Arabic)'}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="col-span-4">
                  <input
                    type="text"
                    value={link.label_en}
                    onChange={(e) => updateLink('shop', index, 'label_en', e.target.value)}
                    placeholder={language === 'ar' ? 'النص (إنجليزي)' : 'Label (English)'}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="col-span-3">
                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) => updateLink('shop', index, 'url', e.target.value)}
                    placeholder="URL"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="col-span-1">
                  <button
                    onClick={() => removeLink('shop', index)}
                    className="w-full bg-red-100 text-red-600 p-2 rounded-lg hover:bg-red-200 transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Support Links */}
        <div className="bg-white rounded-3xl p-6 shadow-lg mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black">{language === 'ar' ? 'روابط الدعم الفني' : 'Support Links'}</h2>
            <button
              onClick={() => addLink('support')}
              className="bg-primary text-white px-4 py-2 rounded-xl font-bold hover:bg-secondary transition-all flex items-center gap-2"
            >
              <Plus size={18} /> {language === 'ar' ? 'إضافة رابط' : 'Add Link'}
            </button>
          </div>
          
          <div className="space-y-4">
            {settings.support_links.map((link, index) => (
              <div key={index} className="grid grid-cols-12 gap-4 items-center p-4 bg-gray-50 rounded-xl">
                <div className="col-span-4">
                  <input
                    type="text"
                    value={link.label_ar}
                    onChange={(e) => updateLink('support', index, 'label_ar', e.target.value)}
                    placeholder={language === 'ar' ? 'النص (عربي)' : 'Label (Arabic)'}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="col-span-4">
                  <input
                    type="text"
                    value={link.label_en}
                    onChange={(e) => updateLink('support', index, 'label_en', e.target.value)}
                    placeholder={language === 'ar' ? 'النص (إنجليزي)' : 'Label (English)'}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="col-span-3">
                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) => updateLink('support', index, 'url', e.target.value)}
                    placeholder="URL"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="col-span-1">
                  <button
                    onClick={() => removeLink('support', index)}
                    className="w-full bg-red-100 text-red-600 p-2 rounded-lg hover:bg-red-200 transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-primary text-white px-8 py-4 rounded-2xl font-bold hover:bg-secondary transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Save size={20} />
            {saving ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (language === 'ar' ? 'حفظ الإعدادات' : 'Save Settings')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSiteSettings;
