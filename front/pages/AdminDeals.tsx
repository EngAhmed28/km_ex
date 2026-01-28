import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { dealsAPI, productsAPI, dashboardAPI } from '../utils/api';
import { Tag, Search, Edit, Trash2, Plus, CheckCircle, XCircle, Clock } from 'lucide-react';

interface AdminDealsProps {
  onNavigate: (page: string) => void;
}

interface Deal {
  id: number;
  title_ar: string;
  title_en: string;
  description_ar?: string;
  description_en?: string;
  product_id?: number;
  product_name?: string;
  product_name_en?: string;
  product_price?: number;
  product_image?: string;
  discount_percentage?: number;
  image_url?: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
}

const AdminDeals: React.FC<AdminDealsProps> = ({ onNavigate }) => {
  const { user: currentUser } = useAuth();
  const { language } = useLanguage();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [addForm, setAddForm] = useState({
    title_ar: '',
    title_en: '',
    description_ar: '',
    description_en: '',
    product_id: '',
    discount_percentage: '',
    image_url: '',
    start_date: '',
    end_date: '',
    is_active: true
  });
  const [editForm, setEditForm] = useState({
    title_ar: '',
    title_en: '',
    description_ar: '',
    description_en: '',
    product_id: '',
    discount_percentage: '',
    image_url: '',
    start_date: '',
    end_date: '',
    is_active: true
  });
  const [addImageFile, setAddImageFile] = useState<File | null>(null);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageErrors, setImageErrors] = useState({ add: '', edit: '' });
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [canCreate, setCanCreate] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [canDelete, setCanDelete] = useState(false);

  useEffect(() => {
    checkPermissions();
    fetchProducts();
  }, []);

  const checkPermissions = async () => {
    if (currentUser?.role === 'admin') {
      setHasPermission(true);
      setCanCreate(true);
      setCanEdit(true);
      setCanDelete(true);
      fetchDeals();
      return;
    }

    if (currentUser?.role === 'employee') {
      try {
        const response = await dashboardAPI.getDashboard();
        if (response.success && response.data?.permissions) {
          const perm = response.data.permissions.find((p: any) =>
            p.permission_type === 'deals' && (p.can_view === true || p.can_view === 1 || p.can_view === '1')
          );
          if (perm) {
            setHasPermission(true);
            setCanCreate(perm.can_create === true || perm.can_create === 1 || perm.can_create === '1');
            setCanEdit(perm.can_edit === true || perm.can_edit === 1 || perm.can_edit === '1');
            setCanDelete(perm.can_delete === true || perm.can_delete === 1 || perm.can_delete === '1');
            fetchDeals();
          } else {
            setHasPermission(false);
            setError(language === 'ar' ? 'ليس لديك صلاحية للوصول إلى هذا المورد' : 'You do not have permission to access this resource');
          }
        } else {
          setHasPermission(false);
          setError(language === 'ar' ? 'ليس لديك صلاحية للوصول إلى هذا المورد' : 'You do not have permission to access this resource');
        }
      } catch (err: any) {
        setHasPermission(false);
        setError(err.message || (language === 'ar' ? 'ليس لديك صلاحية للوصول إلى هذا المورد' : 'You do not have permission to access this resource'));
      } finally {
        setLoading(false);
      }
    } else {
      setHasPermission(false);
      setError(language === 'ar' ? 'ليس لديك صلاحية للوصول إلى هذا المورد' : 'You do not have permission to access this resource');
      setLoading(false);
    }
  };

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const response = await dealsAPI.getAllDeals();
      if (response.success && response.data?.deals) {
        // Format image URLs to full URLs if needed
        const formattedDeals = response.data.deals.map((deal: any) => {
          let imageUrl = deal.image_url || null;
          if (imageUrl && !imageUrl.startsWith('http') && imageUrl.startsWith('/')) {
            imageUrl = `${import.meta.env.VITE_API_URL || 'https://kingofmuscles.metacodecx.com'}${imageUrl}`;
          }
          return { ...deal, image_url: imageUrl };
        });
        setDeals(formattedDeals);
      } else {
        setError(response.message || 'فشل تحميل الصفقات');
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ في الشبكة');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await productsAPI.getAllProducts();
      if (response.success && response.data?.products) {
        setProducts(response.data.products);
      }
    } catch (err: any) {
      console.error('Failed to fetch products:', err);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  };

  const handleImageChange = (file: File | null, type: 'add' | 'edit') => {
    if (!file) {
      if (type === 'add') {
        setAddImageFile(null);
        setImagePreview('');
        setImageErrors({ ...imageErrors, add: '' });
      } else {
        setEditImageFile(null);
        setImageErrors({ ...imageErrors, edit: '' });
      }
      return;
    }

    // Validation
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

    if (!allowedTypes.includes(file.type)) {
      const errorMsg = language === 'ar' ? 'نوع الملف غير مدعوم. يرجى اختيار صورة (JPG, PNG, WEBP, GIF)' : 'File type not supported. Please choose an image (JPG, PNG, WEBP, GIF)';
      if (type === 'add') {
        setImageErrors({ ...imageErrors, add: errorMsg });
      } else {
        setImageErrors({ ...imageErrors, edit: errorMsg });
      }
      return;
    }

    if (file.size > maxSize) {
      const errorMsg = language === 'ar' ? 'حجم الصورة كبير جداً. الحد الأقصى 5 ميجابايت' : 'Image size is too large. Maximum 5MB';
      if (type === 'add') {
        setImageErrors({ ...imageErrors, add: errorMsg });
      } else {
        setImageErrors({ ...imageErrors, edit: errorMsg });
      }
      return;
    }

    // Set file and preview
    if (type === 'add') {
      setAddImageFile(file);
      setImageErrors({ ...imageErrors, add: '' });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setEditImageFile(file);
      setImageErrors({ ...imageErrors, edit: '' });
    }
  };

  const handleAddDeal = async () => {
    if (!addForm.title_ar || !addForm.title_en || !addForm.start_date || !addForm.end_date) {
      alert(language === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields');
      return;
    }

    if (imageErrors.add) {
      alert(imageErrors.add);
      return;
    }

    try {
      let imageUrl: string | null = null;

      // Upload image if file is selected
      if (addImageFile) {
        const formData = new FormData();
        formData.append('image', addImageFile);

        const uploadResponse = await fetch(`${import.meta.env.VITE_API_URL || 'https://kingofmuscles.metacodecx.com/api'}/upload/deal`, {
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
        imageUrl = uploadData.data.url;
      }

      const response = await dealsAPI.createDeal({
        title_ar: addForm.title_ar,
        title_en: addForm.title_en,
        description_ar: addForm.description_ar || null,
        description_en: addForm.description_en || null,
        product_id: addForm.product_id ? parseInt(addForm.product_id) : null,
        discount_percentage: addForm.discount_percentage ? parseFloat(addForm.discount_percentage) : null,
        image_url: imageUrl,
        start_date: addForm.start_date,
        end_date: addForm.end_date,
        is_active: Boolean(addForm.is_active)
      });
      if (response.success) {
        setShowAddModal(false);
        setAddForm({
          title_ar: '',
          title_en: '',
          description_ar: '',
          description_en: '',
          product_id: '',
          discount_percentage: '',
          image_url: '',
          start_date: '',
          end_date: '',
          is_active: true
        });
        setAddImageFile(null);
        setImagePreview('');
        setImageErrors({ ...imageErrors, add: '' });
        fetchDeals();
        alert(language === 'ar' ? 'تم إضافة الصفقة بنجاح' : 'Deal added successfully');
      }
    } catch (err: any) {
      alert(err.message || (language === 'ar' ? 'فشل إضافة الصفقة' : 'Failed to add deal'));
    }
  };

  const handleEdit = (deal: Deal) => {
    setEditingDeal(deal);
    // Ensure image_url has full URL if it's a relative path
    let imageUrl = deal.image_url || '';
    if (imageUrl && !imageUrl.startsWith('http') && imageUrl.startsWith('/')) {
      imageUrl = `${import.meta.env.VITE_API_URL || 'https://kingofmuscles.metacodecx.com'}${imageUrl}`;
    }
    setEditForm({
      title_ar: deal.title_ar,
      title_en: deal.title_en,
      description_ar: deal.description_ar || '',
      description_en: deal.description_en || '',
      product_id: deal.product_id?.toString() || '',
      discount_percentage: deal.discount_percentage?.toString() || '',
      image_url: imageUrl,
      start_date: formatDateTime(deal.start_date),
      end_date: formatDateTime(deal.end_date),
      is_active: deal.is_active
    });
    setEditImageFile(null); // Reset edit image file
    setImageErrors({ ...imageErrors, edit: '' });
    setShowEditModal(true);
  };

  const handleUpdateDeal = async () => {
    if (!editingDeal || !editForm.title_ar || !editForm.title_en || !editForm.start_date || !editForm.end_date) {
      alert(language === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields');
      return;
    }

    if (imageErrors.edit) {
      alert(imageErrors.edit);
      return;
    }

    try {
      let imageUrl: string | null = null;

      // Upload image if new file is selected
      if (editImageFile) {
        const formData = new FormData();
        formData.append('image', editImageFile);

        const uploadResponse = await fetch(`${import.meta.env.VITE_API_URL || 'https://kingofmuscles.metacodecx.com/api'}/upload/deal`, {
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
        imageUrl = uploadData.data.url;
      } else if (editForm.image_url && editForm.image_url.trim() !== '') {
        // Keep existing image URL if no new file is selected
        imageUrl = editForm.image_url.trim();
      }

      const response = await dealsAPI.updateDeal(editingDeal.id, {
        title_ar: editForm.title_ar,
        title_en: editForm.title_en,
        description_ar: editForm.description_ar || null,
        description_en: editForm.description_en || null,
        product_id: editForm.product_id ? parseInt(editForm.product_id) : null,
        discount_percentage: editForm.discount_percentage ? parseFloat(editForm.discount_percentage) : null,
        image_url: imageUrl,
        start_date: editForm.start_date,
        end_date: editForm.end_date,
        is_active: Boolean(editForm.is_active)
      });
      if (response.success) {
        setShowEditModal(false);
        setEditingDeal(null);
        setEditImageFile(null);
        setImageErrors({ ...imageErrors, edit: '' });
        fetchDeals();
        alert(language === 'ar' ? 'تم تحديث الصفقة بنجاح' : 'Deal updated successfully');
      }
    } catch (err: any) {
      alert(err.message || (language === 'ar' ? 'فشل تحديث الصفقة' : 'Failed to update deal'));
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذه الصفقة؟' : 'Are you sure you want to delete this deal?')) {
      return;
    }

    try {
      const response = await dealsAPI.deleteDeal(id);
      if (response.success) {
        fetchDeals();
        alert(language === 'ar' ? 'تم حذف الصفقة بنجاح' : 'Deal deleted successfully');
      }
    } catch (err: any) {
      alert(err.message || (language === 'ar' ? 'فشل حذف الصفقة' : 'Failed to delete deal'));
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      const response = await dealsAPI.toggleDealStatus(id);
      if (response.success) {
        fetchDeals();
      }
    } catch (err: any) {
      alert(err.message || (language === 'ar' ? 'فشل تغيير حالة الصفقة' : 'Failed to toggle deal status'));
    }
  };

  const filteredDeals = deals.filter(deal =>
    deal.title_ar.toLowerCase().includes(searchTerm.toLowerCase()) ||
    deal.title_en.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (hasPermission === null || loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-xl font-bold">{language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</div>
      </div>
    );
  }

  if (!hasPermission) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-xl font-bold text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black">{language === 'ar' ? 'إدارة صفقات اليوم' : 'Deals of the Day Management'}</h2>
        {(currentUser?.role === 'admin' || canCreate) && (
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-primary text-white px-6 py-3 rounded-2xl font-bold hover:bg-secondary transition-all flex items-center gap-2"
          >
            <Plus size={20} /> {language === 'ar' ? 'إضافة صفقة' : 'Add Deal'}
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
        <div className="relative">
          <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder={language === 'ar' ? 'بحث عن صفقة...' : 'Search deals...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-12 pl-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredDeals.map((deal) => {
          const startDate = new Date(deal.start_date);
          const endDate = new Date(deal.end_date);
          const now = new Date();
          const isActive = deal.is_active && now >= startDate && now <= endDate;
          
          return (
            <div key={deal.id} className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Tag className="text-primary" size={24} />
                  <span className={`px-3 py-1 rounded-lg text-sm font-bold ${
                    isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {isActive ? (language === 'ar' ? 'نشط' : 'Active') : (language === 'ar' ? 'غير نشط' : 'Inactive')}
                  </span>
                </div>
                <div className="flex gap-2">
                  {(currentUser?.role === 'admin' || canEdit) && (
                    <button
                      onClick={() => handleEdit(deal)}
                      className="bg-blue-100 text-blue-600 p-2 rounded-xl hover:bg-blue-200 transition-all"
                    >
                      <Edit size={18} />
                    </button>
                  )}
                  {(currentUser?.role === 'admin' || canDelete) && (
                    <button
                      onClick={() => handleDelete(deal.id)}
                      className="bg-red-100 text-red-600 p-2 rounded-xl hover:bg-red-200 transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
              {deal.image_url && (
                <img src={deal.image_url} alt={deal.title_ar} className="w-full h-48 object-cover rounded-xl mb-4" />
              )}
              <h3 className="text-xl font-black mb-2">{language === 'ar' ? deal.title_ar : deal.title_en}</h3>
              {deal.description_ar && (
                <p className="text-gray-500 mb-4">{language === 'ar' ? deal.description_ar : deal.description_en}</p>
              )}
              {deal.product_name && (
                <p className="text-sm text-gray-600 mb-2">
                  {language === 'ar' ? 'المنتج:' : 'Product:'} {language === 'ar' ? deal.product_name : deal.product_name_en}
                </p>
              )}
              {deal.discount_percentage && (
                <p className="text-sm text-primary font-bold mb-2">
                  {language === 'ar' ? 'خصم:' : 'Discount:'} {deal.discount_percentage}%
                </p>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <Clock size={16} />
                <span>{language === 'ar' ? 'من' : 'From'}: {new Date(deal.start_date).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock size={16} />
                <span>{language === 'ar' ? 'إلى' : 'To'}: {new Date(deal.end_date).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl my-8">
            <h3 className="text-2xl font-black mb-4">{language === 'ar' ? 'إضافة صفقة جديدة' : 'Add New Deal'}</h3>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2">{language === 'ar' ? 'العنوان (عربي) *' : 'Title (Arabic) *'}</label>
                  <input
                    type="text"
                    value={addForm.title_ar}
                    onChange={(e) => setAddForm({ ...addForm, title_ar: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">{language === 'ar' ? 'العنوان (إنجليزي) *' : 'Title (English) *'}</label>
                  <input
                    type="text"
                    value={addForm.title_en}
                    onChange={(e) => setAddForm({ ...addForm, title_en: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2">{language === 'ar' ? 'الوصف (عربي)' : 'Description (Arabic)'}</label>
                  <textarea
                    value={addForm.description_ar}
                    onChange={(e) => setAddForm({ ...addForm, description_ar: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">{language === 'ar' ? 'الوصف (إنجليزي)' : 'Description (English)'}</label>
                  <textarea
                    value={addForm.description_en}
                    onChange={(e) => setAddForm({ ...addForm, description_en: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
                    rows={3}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">{language === 'ar' ? 'المنتج' : 'Product'}</label>
                <select
                  value={addForm.product_id}
                  onChange={(e) => setAddForm({ ...addForm, product_id: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
                >
                  <option value="">{language === 'ar' ? 'اختر منتج' : 'Select Product'}</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {language === 'ar' ? product.nameAr : product.nameEn}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2">{language === 'ar' ? 'نسبة الخصم (%)' : 'Discount Percentage (%)'}</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={addForm.discount_percentage}
                    onChange={(e) => setAddForm({ ...addForm, discount_percentage: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">{language === 'ar' ? 'صورة الصفقة' : 'Deal Image'}</label>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                    onChange={(e) => handleImageChange(e.target.files?.[0] || null, 'add')}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
                  />
                  {imageErrors.add && (
                    <p className="text-red-500 text-sm mt-1">{imageErrors.add}</p>
                  )}
                  {imagePreview && (
                    <div className="mt-4">
                      <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-xl border border-gray-200" />
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2">{language === 'ar' ? 'تاريخ البداية *' : 'Start Date *'}</label>
                  <input
                    type="datetime-local"
                    value={addForm.start_date}
                    onChange={(e) => setAddForm({ ...addForm, start_date: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">{language === 'ar' ? 'تاريخ النهاية *' : 'End Date *'}</label>
                  <input
                    type="datetime-local"
                    value={addForm.end_date}
                    onChange={(e) => setAddForm({ ...addForm, end_date: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={addForm.is_active}
                  onChange={(e) => setAddForm({ ...addForm, is_active: e.target.checked })}
                  className="w-5 h-5"
                />
                <label className="text-sm font-bold">{language === 'ar' ? 'نشط' : 'Active'}</label>
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <button
                onClick={handleAddDeal}
                className="flex-1 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-secondary transition-all"
              >
                {language === 'ar' ? 'إضافة' : 'Add'}
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-300 transition-all"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingDeal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl my-8">
            <h3 className="text-2xl font-black mb-4">{language === 'ar' ? 'تعديل الصفقة' : 'Edit Deal'}</h3>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2">{language === 'ar' ? 'العنوان (عربي) *' : 'Title (Arabic) *'}</label>
                  <input
                    type="text"
                    value={editForm.title_ar}
                    onChange={(e) => setEditForm({ ...editForm, title_ar: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">{language === 'ar' ? 'العنوان (إنجليزي) *' : 'Title (English) *'}</label>
                  <input
                    type="text"
                    value={editForm.title_en}
                    onChange={(e) => setEditForm({ ...editForm, title_en: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2">{language === 'ar' ? 'الوصف (عربي)' : 'Description (Arabic)'}</label>
                  <textarea
                    value={editForm.description_ar}
                    onChange={(e) => setEditForm({ ...editForm, description_ar: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">{language === 'ar' ? 'الوصف (إنجليزي)' : 'Description (English)'}</label>
                  <textarea
                    value={editForm.description_en}
                    onChange={(e) => setEditForm({ ...editForm, description_en: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
                    rows={3}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">{language === 'ar' ? 'المنتج' : 'Product'}</label>
                <select
                  value={editForm.product_id}
                  onChange={(e) => setEditForm({ ...editForm, product_id: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
                >
                  <option value="">{language === 'ar' ? 'اختر منتج' : 'Select Product'}</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {language === 'ar' ? product.nameAr : product.nameEn}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2">{language === 'ar' ? 'نسبة الخصم (%)' : 'Discount Percentage (%)'}</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editForm.discount_percentage}
                    onChange={(e) => setEditForm({ ...editForm, discount_percentage: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">{language === 'ar' ? 'صورة الصفقة' : 'Deal Image'}</label>
                  {editingDeal.image_url && !editImageFile && (
                    <div className="mb-4">
                      <img src={editingDeal.image_url} alt="Current image" className="w-full h-48 object-cover rounded-xl border border-gray-200 mb-2" />
                      <p className="text-sm text-gray-500">{language === 'ar' ? 'الصورة الحالية' : 'Current image'}</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                    onChange={(e) => handleImageChange(e.target.files?.[0] || null, 'edit')}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
                  />
                  {imageErrors.edit && (
                    <p className="text-red-500 text-sm mt-1">{imageErrors.edit}</p>
                  )}
                  {editImageFile && (
                    <div className="mt-4">
                      <img src={URL.createObjectURL(editImageFile)} alt="Preview" className="w-full h-48 object-cover rounded-xl border border-gray-200" />
                      <p className="text-sm text-gray-500 mt-2">{language === 'ar' ? 'معاينة الصورة الجديدة' : 'New image preview'}</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2">{language === 'ar' ? 'تاريخ البداية *' : 'Start Date *'}</label>
                  <input
                    type="datetime-local"
                    value={editForm.start_date}
                    onChange={(e) => setEditForm({ ...editForm, start_date: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">{language === 'ar' ? 'تاريخ النهاية *' : 'End Date *'}</label>
                  <input
                    type="datetime-local"
                    value={editForm.end_date}
                    onChange={(e) => setEditForm({ ...editForm, end_date: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editForm.is_active}
                  onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
                  className="w-5 h-5"
                />
                <label className="text-sm font-bold">{language === 'ar' ? 'نشط' : 'Active'}</label>
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <button
                onClick={handleUpdateDeal}
                className="flex-1 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-secondary transition-all"
              >
                {language === 'ar' ? 'تحديث' : 'Update'}
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-300 transition-all"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDeals;
