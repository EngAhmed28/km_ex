import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { apiRequest, dashboardAPI } from '../utils/api';
import { FolderTree, Search, Edit, Trash2, Plus, CheckCircle, XCircle } from 'lucide-react';

interface AdminCategoriesProps {
  onNavigate: (page: string) => void;
}

interface Category {
  id: number;
  name: string;
  name_en?: string;
  description?: string;
  image_url?: string;
  slug?: string;
  is_active: boolean;
  created_at: string;
}

const AdminCategories: React.FC<AdminCategoriesProps> = ({ onNavigate }) => {
  const { user: currentUser } = useAuth();
  const { language, t } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [addForm, setAddForm] = useState({ name: '', name_en: '', description: '', image_url: '', is_active: true });
  const [editForm, setEditForm] = useState({ name: '', name_en: '', description: '', image_url: '', is_active: true });
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
  }, []);

  const checkPermissions = async () => {
    // Admin always has permission
    if (currentUser?.role === 'admin') {
      setHasPermission(true);
      fetchCategories();
      return;
    }

    // For employees, check permissions
    if (currentUser?.role === 'employee') {
      try {
        const response = await dashboardAPI.getDashboard();
        console.log('Dashboard response:', response);
        console.log('Permissions:', response.data?.permissions);
        
        if (response.success && response.data?.permissions) {
          // Check if can_view is true or 1 (MySQL returns 1/0, not true/false)
          // Also handle string '1' and 'true' cases
          const perm = response.data.permissions.find((p: any) => {
            const canViewValue = p.can_view;
            const hasView = canViewValue === true || 
                           canViewValue === 1 || 
                           canViewValue === '1' || 
                           canViewValue === 'true' ||
                           String(canViewValue).toLowerCase() === 'true';
            const isCategories = p.permission_type === 'categories' || p.permission_type === 'category';
            console.log('Checking permission:', { 
              permission_type: p.permission_type, 
              can_view: p.can_view,
              can_view_type: typeof p.can_view,
              hasView, 
              isCategories,
              match: hasView && isCategories
            });
            return isCategories && hasView;
          });
          
          if (perm) {
            console.log('Permission found:', perm);
            setHasPermission(true);
            // Convert MySQL 1/0 to boolean
            setCanCreate(perm.can_create === true || perm.can_create === 1 || perm.can_create === '1');
            setCanEdit(perm.can_edit === true || perm.can_edit === 1 || perm.can_edit === '1');
            setCanDelete(perm.can_delete === true || perm.can_delete === 1 || perm.can_delete === '1');
            fetchCategories();
          } else {
            console.log('No permission found for categories');
            setHasPermission(false);
            setError(language === 'ar' ? 'ليس لديك صلاحية للوصول إلى هذا المورد' : 'You do not have permission to access this resource');
          }
        } else {
          console.log('No permissions in response or response not successful');
          setHasPermission(false);
          setError(language === 'ar' ? 'ليس لديك صلاحية للوصول إلى هذا المورد' : 'You do not have permission to access this resource');
        }
      } catch (err: any) {
        console.error('Permission check error:', err);
        setHasPermission(false);
        setError(err.message || (language === 'ar' ? 'ليس لديك صلاحية للوصول إلى هذا المورد' : 'You do not have permission to access this resource'));
      } finally {
        setLoading(false);
      }
    } else {
      // Not admin or employee
      setHasPermission(false);
      setError(language === 'ar' ? 'ليس لديك صلاحية للوصول إلى هذا المورد' : 'You do not have permission to access this resource');
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await apiRequest('/categories/admin/all', {
        method: 'GET'
      });

      if (response.success && response.data && response.data.categories) {
        // Ensure all categories have required fields
        const formattedCategories = response.data.categories.map((cat: any) => {
          let imageUrl = cat.image_url || cat.image || null;
          // Convert relative path to full URL if needed
          if (imageUrl && !imageUrl.startsWith('http') && imageUrl.startsWith('/')) {
            imageUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${imageUrl}`;
          }
          return {
            id: cat.id,
            name: cat.name || '',
            name_en: cat.name_en || '',
            description: cat.description || '',
            image_url: imageUrl,
            slug: cat.slug || `category-${cat.id}`,
            is_active: cat.is_active !== undefined ? cat.is_active : (cat.isActive !== undefined ? cat.isActive !== 0 : true),
            created_at: cat.created_at || new Date().toISOString()
          };
        });
        setCategories(formattedCategories);
      } else {
        setError(response.message || 'فشل تحميل الأقسام');
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ في الشبكة');
    } finally {
      setLoading(false);
    }
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
      const errorMsg = 'نوع الملف غير مدعوم. يرجى اختيار صورة (JPG, PNG, WEBP, GIF)';
      if (type === 'add') {
        setImageErrors({ ...imageErrors, add: errorMsg });
      } else {
        setImageErrors({ ...imageErrors, edit: errorMsg });
      }
      return;
    }

    if (file.size > maxSize) {
      const errorMsg = 'حجم الصورة كبير جداً. الحد الأقصى 5 ميجابايت';
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

  const handleAddCategory = async () => {
    if (!addForm.name) {
      alert(language === 'ar' ? 'يرجى إدخال اسم القسم' : 'Please enter category name');
      return;
    }

    if (imageErrors.add) {
      alert(imageErrors.add);
      return;
    }

    try {
      let imageUrl = addForm.image_url;

      // Upload image if file is selected
      if (addImageFile) {
        const formData = new FormData();
        formData.append('image', addImageFile);

        const uploadResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/upload/category`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        });

        if (!uploadResponse.ok) {
          throw new Error('فشل رفع الصورة');
        }

        const uploadData = await uploadResponse.json();
        console.log('✅ Image uploaded:', uploadData);
        imageUrl = uploadData.data.url;
        console.log('📸 Image URL:', imageUrl);
      }

      console.log('🔄 Creating category with image_url:', imageUrl);

      const response = await apiRequest('/categories', {
        method: 'POST',
        body: { 
          ...addForm, 
          image_url: imageUrl || null,
          is_active: Boolean(addForm.is_active)
        }
      });

      console.log('✅ Category created response:', response);

      if (response.success) {
        setShowAddModal(false);
        setAddForm({ name: '', name_en: '', description: '', image_url: '', is_active: true });
        setAddImageFile(null);
        setImagePreview('');
        setImageErrors({ ...imageErrors, add: '' });
        fetchCategories();
        alert(t('categoryAdded'));
      } else {
        console.error('❌ Failed to create category:', response);
        alert(response.message || t('categoryCreateFailed'));
      }
    } catch (err: any) {
      console.error('Add category error:', err);
      alert(err.message || t('categoryCreateFailed'));
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    // Ensure image_url has full URL if it's a relative path
    let imageUrl = category.image_url || '';
    if (imageUrl && !imageUrl.startsWith('http') && imageUrl.startsWith('/')) {
      imageUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${imageUrl}`;
    }
    setEditForm({
      name: category.name,
      name_en: category.name_en || '',
      description: category.description || '',
      image_url: imageUrl,
      is_active: category.is_active
    });
    setEditImageFile(null); // Reset edit image file
    setShowEditModal(true);
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || !editForm.name) {
      alert(language === 'ar' ? 'يرجى إدخال اسم القسم' : 'Please enter category name');
      return;
    }

    if (imageErrors.edit) {
      alert(imageErrors.edit);
      return;
    }

    try {
      let imageUrl = editForm.image_url;

      // Upload image if new file is selected
      if (editImageFile) {
        const formData = new FormData();
        formData.append('image', editImageFile);

        const uploadResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/upload/category`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        });

        if (!uploadResponse.ok) {
          throw new Error('فشل رفع الصورة');
        }

        const uploadData = await uploadResponse.json();
        imageUrl = uploadData.data.url;
      }

      const response = await apiRequest(`/categories/${editingCategory.id}`, {
        method: 'PUT',
        body: { 
          ...editForm, 
          image_url: imageUrl || null,
          is_active: Boolean(editForm.is_active)
        }
      });

      if (response.success) {
        setShowEditModal(false);
        setEditingCategory(null);
        setEditImageFile(null);
        setImageErrors({ ...imageErrors, edit: '' });
        fetchCategories();
        alert(t('categoryUpdated'));
      }
    } catch (err: any) {
      alert(err.message || t('categoryUpdateFailed'));
    }
  };

  const handleToggleStatus = async (categoryId: number) => {
    try {
      const response = await apiRequest(`/categories/${categoryId}/toggle-status`, {
        method: 'PUT'
      });

      if (response.success) {
        fetchCategories();
        alert(response.message);
      }
    } catch (err: any) {
      alert(err.message || 'فشل تغيير حالة القسم');
    }
  };

  const handleDelete = async (categoryId: number) => {
    if (!confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذا القسم؟' : 'Are you sure you want to delete this category?')) return;

    try {
      const response = await apiRequest(`/categories/${categoryId}`, {
        method: 'DELETE'
      });

      if (response.success) {
        setCategories(categories.filter(c => c.id !== categoryId));
        alert(t('categoryDeleted'));
      }
    } catch (err: any) {
      alert(err.message || t('categoryDeleteFailed'));
    }
  };

  const filteredCategories = categories.filter(cat =>
    (cat.name && cat.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (cat.name_en && cat.name_en.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading && hasPermission === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl font-bold">{t('loading')}</div>
      </div>
    );
  }

  if (hasPermission === false) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-3xl p-6 shadow-lg">
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 font-bold border border-red-100">
              {error || (language === 'ar' ? 'ليس لديك صلاحية للوصول إلى هذا المورد' : 'You do not have permission to access this resource')}
            </div>
            <button
              onClick={() => onNavigate('admin-dashboard')}
              className="bg-gray-100 text-gray-700 px-6 py-3 rounded-2xl font-bold hover:bg-gray-200 transition-all"
            >
              {language === 'ar' ? 'العودة للداشبورد' : 'Back to Dashboard'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-3xl p-6 mb-6 shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-black mb-2">{t('categoryManagement')}</h1>
              <p className="text-gray-500 font-bold">{t('manageAllCategories')}</p>
            </div>
            <div className="flex gap-4">
              {(currentUser?.role === 'admin' || canCreate) && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-primary text-white px-6 py-3 rounded-2xl font-bold hover:bg-secondary transition-all flex items-center gap-2"
                >
                  <Plus size={20} />
                  {t('addCategory')}
                </button>
              )}
              <button
                onClick={() => onNavigate('admin-dashboard')}
                className="bg-gray-100 text-gray-700 px-6 py-3 rounded-2xl font-bold hover:bg-gray-200 transition-all"
              >
                {t('backToDashboard')}
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className={`absolute ${language === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400`} size={20} />
            <input
              type="text"
              placeholder={t('searchCategory')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full bg-gray-50 ${language === 'ar' ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3 rounded-2xl outline-none border-2 border-transparent focus:border-primary font-bold`}
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 font-bold border border-red-100">
            {error}
          </div>
        )}

        {/* Categories Table */}
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className={`px-6 py-4 ${language === 'ar' ? 'text-right' : 'text-left'} text-sm font-black text-gray-700`}>#</th>
                  <th className={`px-6 py-4 ${language === 'ar' ? 'text-right' : 'text-left'} text-sm font-black text-gray-700`}>{t('nameArabic')}</th>
                  <th className={`px-6 py-4 ${language === 'ar' ? 'text-right' : 'text-left'} text-sm font-black text-gray-700`}>{t('nameEnglish')}</th>
                  <th className={`px-6 py-4 ${language === 'ar' ? 'text-right' : 'text-left'} text-sm font-black text-gray-700`}>{t('categoryImage')}</th>
                  <th className={`px-6 py-4 ${language === 'ar' ? 'text-right' : 'text-left'} text-sm font-black text-gray-700`}>{t('status')}</th>
                  <th className={`px-6 py-4 ${language === 'ar' ? 'text-right' : 'text-left'} text-sm font-black text-gray-700`}>{t('creationDate')}</th>
                  <th className={`px-6 py-4 ${language === 'ar' ? 'text-right' : 'text-left'} text-sm font-black text-gray-700`}>{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500 font-bold">
                      {t('noCategories')}
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((category, index) => (
                    <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-bold">{index + 1}</td>
                      <td className="px-6 py-4 font-bold">{category.name}</td>
                      <td className="px-6 py-4 text-gray-600">{category.name_en || '-'}</td>
                      <td className="px-6 py-4">
                        {category.image_url ? (
                          <img 
                            src={category.image_url.startsWith('http') 
                              ? category.image_url 
                              : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${category.image_url}`} 
                            alt={category.name} 
                            className="w-16 h-16 object-cover rounded-xl"
                            onError={(e) => {
                              console.error('Image load error:', category.image_url);
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded-xl flex items-center justify-center">
                            <FolderTree size={24} className="text-gray-400" />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-xl text-xs font-bold ${
                          category.is_active 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {category.is_active ? t('active') : t('inactive')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm">
                        {new Date(category.created_at).toLocaleDateString('ar-SA')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 justify-end">
                          {(currentUser?.role === 'admin' || canEdit) && (
                            <>
                              <button
                                onClick={() => handleEdit(category)}
                                className="bg-blue-100 text-blue-600 p-2 rounded-xl hover:bg-blue-200 transition-all"
                                title={t('edit')}
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() => handleToggleStatus(category.id)}
                                className={`p-2 rounded-xl transition-all ${
                                  category.is_active
                                    ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                                    : 'bg-green-100 text-green-600 hover:bg-green-200'
                                }`}
                                title={category.is_active ? t('deactivate') : t('activate')}
                              >
                                {category.is_active ? (
                                  <XCircle size={18} />
                                ) : (
                                  <CheckCircle size={18} />
                                )}
                              </button>
                            </>
                          )}
                          {(currentUser?.role === 'admin' || canDelete) && (
                            <button
                              onClick={() => handleDelete(category.id)}
                              className="bg-red-100 text-red-600 p-2 rounded-xl hover:bg-red-200 transition-all"
                              title={t('delete')}
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-black mb-6">{t('addCategoryTitle')}</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-gray-700 mb-2 block">{t('nameArabic')} *</label>
                <input
                  type="text"
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  className="w-full bg-gray-50 px-4 py-3 rounded-2xl outline-none border-2 border-transparent focus:border-primary font-bold"
                  placeholder={language === 'ar' ? 'اسم القسم بالعربي' : 'Category name in Arabic'}
                />
              </div>
              
              <div>
                <label className="text-sm font-bold text-gray-700 mb-2 block">{t('nameEnglish')}</label>
                <input
                  type="text"
                  value={addForm.name_en}
                  onChange={(e) => setAddForm({ ...addForm, name_en: e.target.value })}
                  className="w-full bg-gray-50 px-4 py-3 rounded-2xl outline-none border-2 border-transparent focus:border-primary font-bold"
                  placeholder={language === 'ar' ? 'Category Name (English)' : 'Category Name (English)'}
                />
              </div>

              <div>
                <label className="text-sm font-bold text-gray-700 mb-2 block">{t('description')}</label>
                <textarea
                  value={addForm.description}
                  onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                  className="w-full bg-gray-50 px-4 py-3 rounded-2xl outline-none border-2 border-transparent focus:border-primary font-bold"
                  placeholder={language === 'ar' ? 'وصف القسم' : 'Category description'}
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-bold text-gray-700 mb-2 block">{t('categoryImage')}</label>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  onChange={(e) => handleImageChange(e.target.files?.[0] || null, 'add')}
                  className="w-full bg-gray-50 px-4 py-3 rounded-2xl outline-none border-2 border-transparent focus:border-primary font-bold file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-primary file:text-white hover:file:bg-secondary cursor-pointer"
                />
                {imageErrors.add && (
                  <p className="text-red-500 text-sm mt-1 font-bold">{imageErrors.add}</p>
                )}
                {imagePreview && (
                  <div className="mt-4">
                    <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-xl border-2 border-gray-200" />
                  </div>
                )}
                {!addImageFile && addForm.image_url && (
                  <div className="mt-4">
                    <p className="text-xs text-gray-500 mb-2">{language === 'ar' ? 'الصورة الحالية:' : 'Current Image:'}</p>
                    <img src={addForm.image_url} alt="Current" className="w-32 h-32 object-cover rounded-xl border-2 border-gray-200" />
                  </div>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={addForm.is_active}
                    onChange={(e) => setAddForm({ ...addForm, is_active: e.target.checked })}
                    className="w-5 h-5 rounded"
                  />
                  <span className="text-sm font-bold text-gray-700">{t('activeCategory')}</span>
                </label>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={handleAddCategory}
                className="flex-1 bg-primary text-white py-3 rounded-2xl font-bold hover:bg-secondary transition-all"
              >
                {t('addCategory')}
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setAddForm({ name: '', name_en: '', description: '', image_url: '', is_active: true });
                  setAddImageFile(null);
                  setImagePreview('');
                  setImageErrors({ ...imageErrors, add: '' });
                }}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-2xl font-bold hover:bg-gray-200 transition-all"
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {showEditModal && editingCategory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-black mb-6">{t('editCategoryTitle')}</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-gray-700 mb-2 block">الاسم (عربي) *</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full bg-gray-50 px-4 py-3 rounded-2xl outline-none border-2 border-transparent focus:border-primary font-bold"
                  placeholder="اسم القسم بالعربي"
                />
              </div>
              
              <div>
                <label className="text-sm font-bold text-gray-700 mb-2 block">الاسم (إنجليزي)</label>
                <input
                  type="text"
                  value={editForm.name_en}
                  onChange={(e) => setEditForm({ ...editForm, name_en: e.target.value })}
                  className="w-full bg-gray-50 px-4 py-3 rounded-2xl outline-none border-2 border-transparent focus:border-primary font-bold"
                  placeholder="Category Name (English)"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-gray-700 mb-2 block">الوصف</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full bg-gray-50 px-4 py-3 rounded-2xl outline-none border-2 border-transparent focus:border-primary font-bold"
                  placeholder="وصف القسم"
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-bold text-gray-700 mb-2 block">صورة القسم</label>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  onChange={(e) => handleImageChange(e.target.files?.[0] || null, 'edit')}
                  className="w-full bg-gray-50 px-4 py-3 rounded-2xl outline-none border-2 border-transparent focus:border-primary font-bold file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-primary file:text-white hover:file:bg-secondary cursor-pointer"
                />
                {imageErrors.edit && (
                  <p className="text-red-500 text-sm mt-1 font-bold">{imageErrors.edit}</p>
                )}
                {editImageFile && (
                  <div className="mt-4">
                    <p className="text-xs text-gray-500 mb-2">{language === 'ar' ? 'معاينة الصورة الجديدة:' : 'New Image Preview:'}</p>
                    <img src={URL.createObjectURL(editImageFile)} alt="Preview" className="w-32 h-32 object-cover rounded-xl border-2 border-gray-200" />
                  </div>
                )}
                {!editImageFile && editForm.image_url && (
                  <div className="mt-4">
                    <p className="text-xs text-gray-500 mb-2">{language === 'ar' ? 'الصورة الحالية:' : 'Current Image:'}</p>
                    <img 
                      src={editForm.image_url.startsWith('http') 
                        ? editForm.image_url 
                        : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${editForm.image_url}`} 
                      alt="Current" 
                      className="w-32 h-32 object-cover rounded-xl border-2 border-gray-200"
                      onError={(e) => {
                        console.error('Image load error:', editForm.image_url);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.is_active}
                    onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
                    className="w-5 h-5 rounded"
                  />
                  <span className="text-sm font-bold text-gray-700">{t('activeCategory')}</span>
                </label>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={handleUpdateCategory}
                className="flex-1 bg-primary text-white py-3 rounded-2xl font-bold hover:bg-secondary transition-all"
              >
                {t('saveChanges')}
              </button>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingCategory(null);
                }}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-2xl font-bold hover:bg-gray-200 transition-all"
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
