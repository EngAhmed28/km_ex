import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { brandsAPI, dashboardAPI } from '../utils/api';
import { Building2, Search, Edit, Trash2, Plus, CheckCircle, XCircle } from 'lucide-react';

interface AdminBrandsProps {
  onNavigate: (page: string) => void;
}

interface Brand {
  id: number;
  name: string;
  name_en?: string;
  logo_url?: string;
  website_url?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

const AdminBrands: React.FC<AdminBrandsProps> = ({ onNavigate }) => {
  const { user: currentUser } = useAuth();
  const { language } = useLanguage();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [addForm, setAddForm] = useState({ name: '', name_en: '', logo_url: '', website_url: '', display_order: 0, is_active: true });
  const [editForm, setEditForm] = useState({ name: '', name_en: '', logo_url: '', website_url: '', display_order: 0, is_active: true });
  const [addLogoFile, setAddLogoFile] = useState<File | null>(null);
  const [editLogoFile, setEditLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [logoErrors, setLogoErrors] = useState({ add: '', edit: '' });
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [canCreate, setCanCreate] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [canDelete, setCanDelete] = useState(false);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    if (currentUser?.role === 'admin') {
      setHasPermission(true);
      setCanCreate(true);
      setCanEdit(true);
      setCanDelete(true);
      fetchBrands();
      return;
    }

    if (currentUser?.role === 'employee') {
      try {
        const response = await dashboardAPI.getDashboard();
        if (response.success && response.data?.permissions) {
          const perm = response.data.permissions.find((p: any) =>
            p.permission_type === 'products' && (p.can_view === true || p.can_view === 1 || p.can_view === '1')
          );
          if (perm) {
            setHasPermission(true);
            setCanCreate(perm.can_create === true || perm.can_create === 1 || perm.can_create === '1');
            setCanEdit(perm.can_edit === true || perm.can_edit === 1 || perm.can_edit === '1');
            setCanDelete(perm.can_delete === true || perm.can_delete === 1 || perm.can_delete === '1');
            fetchBrands();
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

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const response = await brandsAPI.getAllBrands();
      if (response.success && response.data?.brands) {
        // Format logo URLs to full URLs if needed
        const formattedBrands = response.data.brands.map((brand: any) => {
          let logoUrl = brand.logo_url || null;
          if (logoUrl && !logoUrl.startsWith('http') && logoUrl.startsWith('/')) {
            logoUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${logoUrl}`;
          }
          return { ...brand, logo_url: logoUrl };
        });
        setBrands(formattedBrands);
      } else {
        setError(response.message || 'فشل تحميل البراندات');
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ في الشبكة');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoChange = (file: File | null, type: 'add' | 'edit') => {
    if (!file) {
      if (type === 'add') {
        setAddLogoFile(null);
        setLogoPreview('');
        setLogoErrors({ ...logoErrors, add: '' });
      } else {
        setEditLogoFile(null);
        setLogoErrors({ ...logoErrors, edit: '' });
      }
      return;
    }

    // Validation
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

    if (!allowedTypes.includes(file.type)) {
      const errorMsg = language === 'ar' ? 'نوع الملف غير مدعوم. يرجى اختيار صورة (JPG, PNG, WEBP, GIF)' : 'File type not supported. Please choose an image (JPG, PNG, WEBP, GIF)';
      if (type === 'add') {
        setLogoErrors({ ...logoErrors, add: errorMsg });
      } else {
        setLogoErrors({ ...logoErrors, edit: errorMsg });
      }
      return;
    }

    if (file.size > maxSize) {
      const errorMsg = language === 'ar' ? 'حجم الصورة كبير جداً. الحد الأقصى 5 ميجابايت' : 'Image size is too large. Maximum 5MB';
      if (type === 'add') {
        setLogoErrors({ ...logoErrors, add: errorMsg });
      } else {
        setLogoErrors({ ...logoErrors, edit: errorMsg });
      }
      return;
    }

    // Set file and preview
    if (type === 'add') {
      setAddLogoFile(file);
      setLogoErrors({ ...logoErrors, add: '' });
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setEditLogoFile(file);
      setLogoErrors({ ...logoErrors, edit: '' });
    }
  };

  const handleAddBrand = async () => {
    if (!addForm.name) {
      alert(language === 'ar' ? 'يرجى إدخال اسم البراند' : 'Please enter brand name');
      return;
    }

    if (logoErrors.add) {
      alert(logoErrors.add);
      return;
    }

    try {
      let logoUrl: string | null = null;

      // Upload logo if file is selected
      if (addLogoFile) {
        const formData = new FormData();
        formData.append('image', addLogoFile);

        const uploadResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/upload/brand`, {
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

      // Clean website_url - remove leading slash if present
      let websiteUrl = addForm.website_url?.trim() || null;
      if (websiteUrl && websiteUrl.startsWith('/')) {
        websiteUrl = websiteUrl.substring(1);
      }
      if (websiteUrl === '') {
        websiteUrl = null;
      }

      const response = await brandsAPI.createBrand({
        name: addForm.name,
        name_en: addForm.name_en?.trim() || null,
        logo_url: logoUrl,
        website_url: websiteUrl,
        display_order: addForm.display_order,
        is_active: addForm.is_active
      });
      if (response.success) {
        setShowAddModal(false);
        setAddForm({ name: '', name_en: '', logo_url: '', website_url: '', display_order: 0, is_active: true });
        setAddLogoFile(null);
        setLogoPreview('');
        setLogoErrors({ ...logoErrors, add: '' });
        fetchBrands();
        alert(language === 'ar' ? 'تم إضافة البراند بنجاح' : 'Brand added successfully');
      }
    } catch (err: any) {
      alert(err.message || (language === 'ar' ? 'فشل إضافة البراند' : 'Failed to add brand'));
    }
  };

  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand);
    // Ensure logo_url has full URL if it's a relative path
    let logoUrl = brand.logo_url || '';
    if (logoUrl && !logoUrl.startsWith('http') && logoUrl.startsWith('/')) {
      logoUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${logoUrl}`;
    }
    setEditForm({
      name: brand.name,
      name_en: brand.name_en || '',
      logo_url: logoUrl,
      website_url: brand.website_url || '',
      display_order: brand.display_order,
      is_active: brand.is_active
    });
    setEditLogoFile(null); // Reset edit logo file
    setShowEditModal(true);
  };

  const handleUpdateBrand = async () => {
    if (!editingBrand || !editForm.name) {
      alert(language === 'ar' ? 'يرجى إدخال اسم البراند' : 'Please enter brand name');
      return;
    }

    if (logoErrors.edit) {
      alert(logoErrors.edit);
      return;
    }

    try {
      let logoUrl: string | null = null;

      // Upload logo if new file is selected
      if (editLogoFile) {
        const formData = new FormData();
        formData.append('image', editLogoFile);

        const uploadResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/upload/brand`, {
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
      } else if (editForm.logo_url && editForm.logo_url.trim() !== '') {
        // Keep existing logo URL if no new file is selected
        logoUrl = editForm.logo_url.trim();
      }

      // Clean website_url - remove leading slash if present
      let websiteUrl = editForm.website_url?.trim() || null;
      if (websiteUrl && websiteUrl.startsWith('/')) {
        websiteUrl = websiteUrl.substring(1);
      }
      if (websiteUrl === '') {
        websiteUrl = null;
      }

      const response = await brandsAPI.updateBrand(editingBrand.id, {
        name: editForm.name,
        name_en: editForm.name_en?.trim() || null,
        logo_url: logoUrl,
        website_url: websiteUrl,
        display_order: editForm.display_order,
        is_active: editForm.is_active
      });
      if (response.success) {
        setShowEditModal(false);
        setEditingBrand(null);
        setEditLogoFile(null);
        setLogoErrors({ ...logoErrors, edit: '' });
        fetchBrands();
        alert(language === 'ar' ? 'تم تحديث البراند بنجاح' : 'Brand updated successfully');
      }
    } catch (err: any) {
      alert(err.message || (language === 'ar' ? 'فشل تحديث البراند' : 'Failed to update brand'));
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذا البراند؟' : 'Are you sure you want to delete this brand?')) {
      return;
    }

    try {
      const response = await brandsAPI.deleteBrand(id);
      if (response.success) {
        fetchBrands();
        alert(language === 'ar' ? 'تم حذف البراند بنجاح' : 'Brand deleted successfully');
      }
    } catch (err: any) {
      alert(err.message || (language === 'ar' ? 'فشل حذف البراند' : 'Failed to delete brand'));
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      const response = await brandsAPI.toggleBrandStatus(id);
      if (response.success) {
        fetchBrands();
      }
    } catch (err: any) {
      alert(err.message || (language === 'ar' ? 'فشل تغيير حالة البراند' : 'Failed to toggle brand status'));
    }
  };

  const filteredBrands = brands.filter(brand =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (brand.name_en && brand.name_en.toLowerCase().includes(searchTerm.toLowerCase()))
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
        <h2 className="text-2xl font-black">{language === 'ar' ? 'إدارة البراندات' : 'Brands Management'}</h2>
        {(currentUser?.role === 'admin' || canCreate) && (
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-primary text-white px-6 py-3 rounded-2xl font-bold hover:bg-secondary transition-all flex items-center gap-2"
          >
            <Plus size={20} /> {language === 'ar' ? 'إضافة براند' : 'Add Brand'}
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
        <div className="relative">
          <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder={language === 'ar' ? 'بحث عن براند...' : 'Search brands...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-12 pl-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBrands.map((brand) => (
          <div key={brand.id} className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              {brand.logo_url ? (
                <img src={brand.logo_url} alt={brand.name} className="h-16 object-contain" />
              ) : (
                <div className="h-16 w-16 bg-gray-100 rounded-xl flex items-center justify-center">
                  <Building2 className="text-gray-400" size={32} />
                </div>
              )}
              <div className="flex gap-2">
                {(currentUser?.role === 'admin' || canEdit) && (
                  <button
                    onClick={() => handleEdit(brand)}
                    className="bg-blue-100 text-blue-600 p-2 rounded-xl hover:bg-blue-200 transition-all"
                  >
                    <Edit size={18} />
                  </button>
                )}
                {(currentUser?.role === 'admin' || canDelete) && (
                  <button
                    onClick={() => handleDelete(brand.id)}
                    className="bg-red-100 text-red-600 p-2 rounded-xl hover:bg-red-200 transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>
            <h3 className="text-xl font-black mb-2">{brand.name}</h3>
            {brand.name_en && <p className="text-gray-500 mb-2">{brand.name_en}</p>}
            {brand.website_url && (
              <a href={brand.website_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">
                {language === 'ar' ? 'زيارة الموقع' : 'Visit Website'}
              </a>
            )}
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-gray-500">{language === 'ar' ? 'ترتيب العرض:' : 'Display Order:'} {brand.display_order}</span>
              <button
                onClick={() => handleToggleStatus(brand.id)}
                className={`p-2 rounded-xl transition-all ${
                  brand.is_active
                    ? 'bg-green-100 text-green-600 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {brand.is_active ? <CheckCircle size={20} /> : <XCircle size={20} />}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-2xl font-black mb-4">{language === 'ar' ? 'إضافة براند جديد' : 'Add New Brand'}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">{language === 'ar' ? 'الاسم (عربي)' : 'Name (Arabic)'}</label>
                <input
                  type="text"
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">{language === 'ar' ? 'الاسم (إنجليزي)' : 'Name (English)'}</label>
                <input
                  type="text"
                  value={addForm.name_en}
                  onChange={(e) => setAddForm({ ...addForm, name_en: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">{language === 'ar' ? 'شعار البراند' : 'Brand Logo'}</label>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  onChange={(e) => handleLogoChange(e.target.files?.[0] || null, 'add')}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
                />
                {logoErrors.add && (
                  <p className="text-red-500 text-sm mt-1">{logoErrors.add}</p>
                )}
                {logoPreview && (
                  <div className="mt-4">
                    <img src={logoPreview} alt="Preview" className="h-32 object-contain rounded-xl border border-gray-200" />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">{language === 'ar' ? 'رابط الموقع' : 'Website URL'}</label>
                <input
                  type="url"
                  value={addForm.website_url}
                  onChange={(e) => setAddForm({ ...addForm, website_url: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">{language === 'ar' ? 'ترتيب العرض' : 'Display Order'}</label>
                <input
                  type="number"
                  value={addForm.display_order}
                  onChange={(e) => setAddForm({ ...addForm, display_order: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
                />
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
                onClick={handleAddBrand}
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
      {showEditModal && editingBrand && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-2xl font-black mb-4">{language === 'ar' ? 'تعديل البراند' : 'Edit Brand'}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">{language === 'ar' ? 'الاسم (عربي)' : 'Name (Arabic)'}</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">{language === 'ar' ? 'الاسم (إنجليزي)' : 'Name (English)'}</label>
                <input
                  type="text"
                  value={editForm.name_en}
                  onChange={(e) => setEditForm({ ...editForm, name_en: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">{language === 'ar' ? 'شعار البراند' : 'Brand Logo'}</label>
                {editingBrand.logo_url && !editLogoFile && (
                  <div className="mb-4">
                    <img src={editingBrand.logo_url} alt="Current logo" className="h-32 object-contain rounded-xl border border-gray-200 mb-2" />
                    <p className="text-sm text-gray-500">{language === 'ar' ? 'الشعار الحالي' : 'Current logo'}</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  onChange={(e) => handleLogoChange(e.target.files?.[0] || null, 'edit')}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
                />
                {logoErrors.edit && (
                  <p className="text-red-500 text-sm mt-1">{logoErrors.edit}</p>
                )}
                {editLogoFile && (
                  <div className="mt-4">
                    <img src={URL.createObjectURL(editLogoFile)} alt="Preview" className="h-32 object-contain rounded-xl border border-gray-200" />
                    <p className="text-sm text-gray-500 mt-2">{language === 'ar' ? 'معاينة الشعار الجديد' : 'New logo preview'}</p>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">{language === 'ar' ? 'رابط الموقع' : 'Website URL'}</label>
                <input
                  type="url"
                  value={editForm.website_url}
                  onChange={(e) => setEditForm({ ...editForm, website_url: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">{language === 'ar' ? 'ترتيب العرض' : 'Display Order'}</label>
                <input
                  type="number"
                  value={editForm.display_order}
                  onChange={(e) => setEditForm({ ...editForm, display_order: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
                />
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
                onClick={handleUpdateBrand}
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

export default AdminBrands;
