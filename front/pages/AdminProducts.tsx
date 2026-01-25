import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { apiRequest, categoriesAPI, productsAPI, productImagesAPI } from '../utils/api';
import { Package, Search, Edit, Trash2, Plus, CheckCircle, XCircle, X, Star } from 'lucide-react';

interface AdminProductsProps {
  onNavigate: (page: string) => void;
}

interface Product {
  id: string;
  nameAr: string;
  nameEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  price: number;
  oldPrice?: number;
  image?: string;
  category: string;
  category_id?: number;
  stock: number;
  rating: number;
  reviewsCount: number;
  weight?: string;
  flavor: string[];
  nutrition: Array<{ labelAr: string; labelEn: string; value: string }>;
  is_active: boolean;
  created_at: string;
}

interface Category {
  id: number;
  name: string;
  name_en?: string;
}

const AdminProducts: React.FC<AdminProductsProps> = ({ onNavigate }) => {
  const { user: currentUser } = useAuth();
  const { language, t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [addForm, setAddForm] = useState({
    name_ar: '',
    name_en: '',
    description_ar: '',
    description_en: '',
    price: '',
    old_price: '',
    category_id: '',
    stock: '',
    rating: '',
    reviews_count: '',
    weight: '',
    flavors: [] as string[],
    nutrition: [] as Array<{ labelAr: string; labelEn: string; value: string }>,
    is_active: true,
    country_of_origin: '',
    expiry_date: '',
    manufacture_date: '',
    ingredients: [] as string[],
    usage_instructions_ar: '',
    usage_instructions_en: '',
    safety_warnings_ar: '',
    safety_warnings_en: ''
  });
  
  const [editForm, setEditForm] = useState({
    name_ar: '',
    name_en: '',
    description_ar: '',
    description_en: '',
    price: '',
    old_price: '',
    category_id: '',
    stock: '',
    rating: '',
    reviews_count: '',
    weight: '',
    flavors: [] as string[],
    nutrition: [] as Array<{ labelAr: string; labelEn: string; value: string }>,
    is_active: true,
    country_of_origin: '',
    expiry_date: '',
    manufacture_date: '',
    ingredients: [] as string[],
    usage_instructions_ar: '',
    usage_instructions_en: '',
    safety_warnings_ar: '',
    safety_warnings_en: ''
  });
  
  const [addImageFiles, setAddImageFiles] = useState<File[]>([]);
  const [addImagePreviews, setAddImagePreviews] = useState<string[]>([]);
  const [editImageFiles, setEditImageFiles] = useState<File[]>([]);
  const [editImagePreviews, setEditImagePreviews] = useState<string[]>([]);
  const [productImages, setProductImages] = useState<Array<{id: number, url: string, is_primary: boolean}>>([]);
  const [imageErrors, setImageErrors] = useState({ add: '', edit: '' });
  const [newFlavor, setNewFlavor] = useState('');
  const [newNutrition, setNewNutrition] = useState({ labelAr: '', labelEn: '', value: '' });
  const [newIngredient, setNewIngredient] = useState('');

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAllCategories();
      if (response.success && response.data && response.data.categories) {
        setCategories(response.data.categories.map((cat: any) => ({
          id: cat.id,
          name: cat.name || '',
          name_en: cat.name_en || ''
        })));
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await apiRequest('/products/admin/all', {
        method: 'GET'
      });

      if (response.success && response.data && response.data.products) {
        const formattedProducts = response.data.products.map((product: any) => {
          let imageUrl = product.image || null;
          if (imageUrl && !imageUrl.startsWith('http') && imageUrl.startsWith('/')) {
            imageUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${imageUrl}`;
          }
          return {
            ...product,
            image: imageUrl
          };
        });
        setProducts(formattedProducts);
      } else {
        setError(response.message || 'فشل تحميل المنتجات');
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ في الشبكة');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (files: FileList | null, type: 'add' | 'edit') => {
    if (!files || files.length === 0) {
      if (type === 'add') {
        setAddImageFiles([]);
        setAddImagePreviews([]);
        setImageErrors({ ...imageErrors, add: '' });
      } else {
        setEditImageFiles([]);
        setEditImagePreviews([]);
        setImageErrors({ ...imageErrors, edit: '' });
      }
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const fileArray = Array.from(files);
    
    // Validate all files
    for (const file of fileArray) {
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
        const errorMsg = 'حجم الصورة كبير جداً. الحد الأقصى 5MB';
        if (type === 'add') {
          setImageErrors({ ...imageErrors, add: errorMsg });
        } else {
          setImageErrors({ ...imageErrors, edit: errorMsg });
        }
        return;
      }
    }

    if (type === 'add') {
      setAddImageFiles(fileArray);
      setAddImagePreviews(fileArray.map(file => URL.createObjectURL(file)));
      setImageErrors({ ...imageErrors, add: '' });
    } else {
      setEditImageFiles(fileArray);
      setEditImagePreviews(fileArray.map(file => URL.createObjectURL(file)));
      setImageErrors({ ...imageErrors, edit: '' });
    }
  };

  const removeImage = (index: number, type: 'add' | 'edit') => {
    if (type === 'add') {
      const newFiles = addImageFiles.filter((_, i) => i !== index);
      const newPreviews = addImagePreviews.filter((_, i) => i !== index);
      setAddImageFiles(newFiles);
      setAddImagePreviews(newPreviews);
    } else {
      const newFiles = editImageFiles.filter((_, i) => i !== index);
      const newPreviews = editImagePreviews.filter((_, i) => i !== index);
      setEditImageFiles(newFiles);
      setEditImagePreviews(newPreviews);
    }
  };

  const handleAddProduct = async () => {
    if (!addForm.name_ar && !addForm.name_en) {
      alert(language === 'ar' ? 'يرجى إدخال اسم المنتج' : 'Please enter product name');
      return;
    }

    if (!addForm.price) {
      alert(language === 'ar' ? 'يرجى إدخال سعر المنتج' : 'Please enter product price');
      return;
    }

    if (imageErrors.add) {
      alert(imageErrors.add);
      return;
    }

    try {
      let imageUrl = '';

      // Create product first
      const response = await apiRequest('/products', {
        method: 'POST',
        body: {
          name_ar: addForm.name_ar,
          name_en: addForm.name_en,
          description_ar: addForm.description_ar,
          description_en: addForm.description_en,
          price: parseFloat(addForm.price),
          old_price: addForm.old_price ? parseFloat(addForm.old_price) : null,
          image_url: null, // We'll use product_images table instead
          category_id: addForm.category_id ? parseInt(addForm.category_id) : null,
          stock: addForm.stock ? parseInt(addForm.stock) : 0,
          rating: addForm.rating ? parseFloat(addForm.rating) : 0,
          reviews_count: addForm.reviews_count ? parseInt(addForm.reviews_count) : 0,
          weight: addForm.weight || null,
          flavors: addForm.flavors,
          nutrition: addForm.nutrition,
          is_active: Boolean(addForm.is_active),
          // Additional fields
          country_of_origin: addForm.country_of_origin || null,
          expiry_date: addForm.expiry_date || null,
          manufacture_date: addForm.manufacture_date || null,
          ingredients: addForm.ingredients,
          usage_instructions_ar: addForm.usage_instructions_ar || null,
          usage_instructions_en: addForm.usage_instructions_en || null,
          safety_warnings_ar: addForm.safety_warnings_ar || null,
          safety_warnings_en: addForm.safety_warnings_en || null
        }
      });

      if (response.success && response.data && response.data.product) {
        const productId = response.data.product.id;

        // Upload images if any
        if (addImageFiles.length > 0) {
          const formData = new FormData();
          addImageFiles.forEach(file => {
            formData.append('images', file);
          });

          const uploadResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/upload/products`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
          });

          if (uploadResponse.ok) {
            const uploadData = await uploadResponse.json();
            if (uploadData.success && uploadData.data && uploadData.data.images) {
              // Add images to product
              for (let i = 0; i < uploadData.data.images.length; i++) {
                const imageUrl = uploadData.data.images[i].url;
                await productImagesAPI.addProductImage(productId, imageUrl, i === 0); // First image is primary
              }
            }
          }
        }

        setShowAddModal(false);
        setAddForm({
          name_ar: '',
          name_en: '',
          description_ar: '',
          description_en: '',
          price: '',
          old_price: '',
          category_id: '',
          stock: '',
          rating: '',
          reviews_count: '',
          weight: '',
          flavors: [],
          nutrition: [],
          is_active: true,
          country_of_origin: '',
          expiry_date: '',
          manufacture_date: '',
          ingredients: [],
          usage_instructions_ar: '',
          usage_instructions_en: '',
          safety_warnings_ar: '',
          safety_warnings_en: ''
        });
        setAddImageFiles([]);
        setAddImagePreviews([]);
        setImageErrors({ ...imageErrors, add: '' });
        fetchProducts();
        alert(t('productAdded'));
      }
    } catch (err: any) {
      alert(err.message || t('productCreateFailed'));
    }
  };

  const handleEdit = async (product: Product) => {
    try {
      // Fetch full product details from API to ensure we have all fields including additional details
      const response = await productsAPI.getProductById(product.id);
      
      if (response.success && response.data && response.data.product) {
        const fullProduct = response.data.product;
        
        setEditingProduct(fullProduct);
        
        // Format dates for date inputs (YYYY-MM-DD format)
        const formatDate = (dateStr: string | null | undefined) => {
          if (!dateStr) return '';
          // If date is in format "YYYY-MM-DD" or "YYYY-MM-DD HH:MM:SS", extract just the date part
          return dateStr.split('T')[0].split(' ')[0];
        };
        
        setEditForm({
          name_ar: fullProduct.nameAr || '',
          name_en: fullProduct.nameEn || '',
          description_ar: fullProduct.descriptionAr || '',
          description_en: fullProduct.descriptionEn || '',
          price: fullProduct.price.toString(),
          old_price: fullProduct.oldPrice?.toString() || '',
          category_id: fullProduct.category_id?.toString() || '',
          stock: fullProduct.stock.toString(),
          rating: fullProduct.rating.toString(),
          reviews_count: fullProduct.reviewsCount.toString(),
          weight: fullProduct.weight || '',
          flavors: fullProduct.flavor || [],
          nutrition: fullProduct.nutrition || [],
          is_active: fullProduct.is_active,
          country_of_origin: fullProduct.country_of_origin || '',
          expiry_date: formatDate(fullProduct.expiry_date),
          manufacture_date: formatDate(fullProduct.manufacture_date),
          ingredients: Array.isArray(fullProduct.ingredients) ? fullProduct.ingredients : [],
          usage_instructions_ar: fullProduct.usage_instructions_ar || '',
          usage_instructions_en: fullProduct.usage_instructions_en || '',
          safety_warnings_ar: fullProduct.safety_warnings_ar || '',
          safety_warnings_en: fullProduct.safety_warnings_en || ''
        });
        setEditImageFiles([]);
        setEditImagePreviews([]);
        
        // Fetch product images
        try {
          const imagesResponse = await productImagesAPI.getProductImages(product.id);
          if (imagesResponse.success && imagesResponse.data && imagesResponse.data.images) {
            const images = imagesResponse.data.images.map((img: any) => ({
              id: img.id,
              url: img.image_url.startsWith('http') 
                ? img.image_url 
                : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${img.image_url}`,
              is_primary: img.is_primary === 1
            }));
            setProductImages(images);
          }
        } catch (err) {
          console.error('Error fetching product images:', err);
          setProductImages([]);
        }
        
        setShowEditModal(true);
      } else {
        alert(language === 'ar' ? 'فشل تحميل بيانات المنتج' : 'Failed to load product data');
      }
    } catch (err: any) {
      console.error('Error fetching product:', err);
      alert(err.message || (language === 'ar' ? 'حدث خطأ أثناء تحميل المنتج' : 'Error loading product'));
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    if (!confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذه الصورة؟' : 'Are you sure you want to delete this image?')) return;
    
    try {
      await productImagesAPI.deleteProductImage(imageId);
      setProductImages(productImages.filter(img => img.id !== imageId));
      alert(language === 'ar' ? 'تم حذف الصورة بنجاح' : 'Image deleted successfully');
    } catch (err: any) {
      alert(err.message || 'فشل حذف الصورة');
    }
  };

  const handleSetPrimaryImage = async (imageId: number) => {
    try {
      await productImagesAPI.setPrimaryImage(imageId);
      setProductImages(productImages.map(img => ({
        ...img,
        is_primary: img.id === imageId
      })));
      alert(language === 'ar' ? 'تم تعيين الصورة كصورة رئيسية' : 'Primary image set successfully');
    } catch (err: any) {
      alert(err.message || 'فشل تعيين الصورة الرئيسية');
    }
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct || (!editForm.name_ar && !editForm.name_en)) {
      alert(language === 'ar' ? 'يرجى إدخال اسم المنتج' : 'Please enter product name');
      return;
    }

    if (imageErrors.edit) {
      alert(imageErrors.edit);
      return;
    }

    try {
      // Update product
      const response = await apiRequest(`/products/${editingProduct.id}`, {
        method: 'PUT',
        body: {
          name_ar: editForm.name_ar,
          name_en: editForm.name_en,
          description_ar: editForm.description_ar,
          description_en: editForm.description_en,
          price: parseFloat(editForm.price),
          old_price: editForm.old_price ? parseFloat(editForm.old_price) : null,
          image_url: null, // We use product_images table
          category_id: editForm.category_id ? parseInt(editForm.category_id) : null,
          stock: parseInt(editForm.stock),
          rating: parseFloat(editForm.rating),
          reviews_count: parseInt(editForm.reviews_count),
          weight: editForm.weight || null,
          flavors: editForm.flavors,
          nutrition: editForm.nutrition,
          is_active: Boolean(editForm.is_active),
          country_of_origin: editForm.country_of_origin || null,
          expiry_date: editForm.expiry_date || null,
          manufacture_date: editForm.manufacture_date || null,
          ingredients: editForm.ingredients,
          usage_instructions_ar: editForm.usage_instructions_ar || null,
          usage_instructions_en: editForm.usage_instructions_en || null,
          safety_warnings_ar: editForm.safety_warnings_ar || null,
          safety_warnings_en: editForm.safety_warnings_en || null
        }
      });

      if (response.success) {
        setShowEditModal(false);
        setEditingProduct(null);
        setEditImageFiles([]);
        setEditImagePreviews([]);
        setProductImages([]);
        setEditImageFile(null);
        setImageErrors({ ...imageErrors, edit: '' });
        fetchProducts();
        alert(t('productUpdated'));
      }
    } catch (err: any) {
      alert(err.message || t('productUpdateFailed'));
    }
  };

  const handleToggleStatus = async (productId: string) => {
    try {
      const response = await apiRequest(`/products/${productId}/toggle-status`, {
        method: 'PUT'
      });

      if (response.success) {
        fetchProducts();
        alert(response.message);
      }
    } catch (err: any) {
      alert(err.message || 'فشل تغيير حالة المنتج');
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذا المنتج؟' : 'Are you sure you want to delete this product?')) return;

    try {
      const response = await apiRequest(`/products/${productId}`, {
        method: 'DELETE'
      });

      if (response.success) {
        setProducts(products.filter(p => p.id !== productId));
        alert(t('productDeleted'));
      }
    } catch (err: any) {
      alert(err.message || t('productDeleteFailed'));
    }
  };

  const filteredProducts = products.filter(product =>
    (product.nameAr && product.nameAr.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (product.nameEn && product.nameEn.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl font-bold">{t('loading')}</div>
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
              <h1 className="text-3xl font-black mb-2">{t('productManagement')}</h1>
              <p className="text-gray-500 font-bold">{t('manageAllProducts')}</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-primary text-white px-6 py-3 rounded-2xl font-bold hover:bg-secondary transition-all flex items-center gap-2"
              >
                <Plus size={20} />
                {t('addProduct')}
              </button>
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
              placeholder={t('searchProduct')}
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

        {/* Products Table */}
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className={`px-6 py-4 ${language === 'ar' ? 'text-right' : 'text-left'} text-sm font-black text-gray-700`}>#</th>
                  <th className={`px-6 py-4 ${language === 'ar' ? 'text-right' : 'text-left'} text-sm font-black text-gray-700`}>{t('nameArabic')}</th>
                  <th className={`px-6 py-4 ${language === 'ar' ? 'text-right' : 'text-left'} text-sm font-black text-gray-700`}>{t('price')}</th>
                  <th className={`px-6 py-4 ${language === 'ar' ? 'text-right' : 'text-left'} text-sm font-black text-gray-700`}>{t('stock')}</th>
                  <th className={`px-6 py-4 ${language === 'ar' ? 'text-right' : 'text-left'} text-sm font-black text-gray-700`}>{t('status')}</th>
                  <th className={`px-6 py-4 ${language === 'ar' ? 'text-right' : 'text-left'} text-sm font-black text-gray-700`}>{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 font-bold">
                      {t('noProducts')}
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product, index) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-bold">{index + 1}</td>
                      <td className="px-6 py-4">
                        <div className="font-bold">{language === 'ar' ? product.nameAr : product.nameEn}</div>
                        <div className="text-sm text-gray-500">{product.category}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-primary">{product.price} {language === 'ar' ? 'ر.س' : 'SAR'}</div>
                        {product.oldPrice && (
                          <div className="text-sm text-gray-400 line-through">{product.oldPrice} {language === 'ar' ? 'ر.س' : 'SAR'}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-bold">{product.stock}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-xl text-xs font-bold ${
                          product.is_active 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {product.is_active ? t('active') : t('inactive')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleEdit(product)}
                            className="bg-blue-100 text-blue-600 p-2 rounded-xl hover:bg-blue-200 transition-all"
                            title={t('edit')}
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(product.id)}
                            className={`p-2 rounded-xl transition-all ${
                              product.is_active
                                ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                                : 'bg-green-100 text-green-600 hover:bg-green-200'
                            }`}
                            title={product.is_active ? t('deactivate') : t('activate')}
                          >
                            {product.is_active ? (
                              <XCircle size={18} />
                            ) : (
                              <CheckCircle size={18} />
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="bg-red-100 text-red-600 p-2 rounded-xl hover:bg-red-200 transition-all"
                            title={t('delete')}
                          >
                            <Trash2 size={18} />
                          </button>
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

      {/* Add Product Modal - Due to length, I'll create a simplified version */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-black mb-6">{t('addProductTitle')}</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 block">{t('nameArabic')} *</label>
                  <input
                    type="text"
                    value={addForm.name_ar}
                    onChange={(e) => setAddForm({ ...addForm, name_ar: e.target.value })}
                    className="w-full bg-gray-50 px-4 py-3 rounded-2xl outline-none border-2 border-transparent focus:border-primary font-bold"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 block">{t('nameEnglish')}</label>
                  <input
                    type="text"
                    value={addForm.name_en}
                    onChange={(e) => setAddForm({ ...addForm, name_en: e.target.value })}
                    className="w-full bg-gray-50 px-4 py-3 rounded-2xl outline-none border-2 border-transparent focus:border-primary font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 block">{t('price')} *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={addForm.price}
                    onChange={(e) => setAddForm({ ...addForm, price: e.target.value })}
                    className="w-full bg-gray-50 px-4 py-3 rounded-2xl outline-none border-2 border-transparent focus:border-primary font-bold"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 block">{t('oldPrice')}</label>
                  <input
                    type="number"
                    step="0.01"
                    value={addForm.old_price}
                    onChange={(e) => setAddForm({ ...addForm, old_price: e.target.value })}
                    className="w-full bg-gray-50 px-4 py-3 rounded-2xl outline-none border-2 border-transparent focus:border-primary font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 block">{t('productCategory')}</label>
                  <select
                    value={addForm.category_id}
                    onChange={(e) => setAddForm({ ...addForm, category_id: e.target.value })}
                    className="w-full bg-gray-50 px-4 py-3 rounded-2xl outline-none border-2 border-transparent focus:border-primary font-bold"
                  >
                    <option value="">{t('all')}</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{language === 'ar' ? cat.name : (cat.name_en || cat.name)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 block">{t('stock')}</label>
                  <input
                    type="number"
                    value={addForm.stock}
                    onChange={(e) => setAddForm({ ...addForm, stock: e.target.value })}
                    className="w-full bg-gray-50 px-4 py-3 rounded-2xl outline-none border-2 border-transparent focus:border-primary font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-gray-700 mb-2 block">{t('productImage')} ({language === 'ar' ? 'يمكن رفع عدة صور' : 'Multiple images allowed'})</label>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  multiple
                  onChange={(e) => handleImageChange(e.target.files, 'add')}
                  className="w-full bg-gray-50 px-4 py-3 rounded-2xl outline-none border-2 border-transparent focus:border-primary font-bold file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-primary file:text-white hover:file:bg-secondary cursor-pointer"
                />
                {imageErrors.add && (
                  <p className="text-red-500 text-sm mt-1 font-bold">{imageErrors.add}</p>
                )}
                {addImagePreviews.length > 0 && (
                  <div className="mt-4 grid grid-cols-4 gap-4">
                    {addImagePreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-32 object-cover rounded-xl border-2 border-gray-200" />
                        {index === 0 && (
                          <div className="absolute top-2 right-2 bg-primary text-white text-xs px-2 py-1 rounded-full font-bold">
                            {language === 'ar' ? 'رئيسية' : 'Primary'}
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(index, 'add')}
                          className="absolute top-2 left-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Additional Details Section */}
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h3 className="text-lg font-black mb-4">{language === 'ar' ? 'تفاصيل إضافية' : 'Additional Details'}</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-sm font-bold text-gray-700 mb-2 block">{language === 'ar' ? 'بلد الصنع' : 'Country of Origin'}</label>
                    <input
                      type="text"
                      value={addForm.country_of_origin}
                      onChange={(e) => setAddForm({ ...addForm, country_of_origin: e.target.value })}
                      className="w-full bg-gray-50 px-4 py-3 rounded-2xl outline-none border-2 border-transparent focus:border-primary font-bold"
                      placeholder={language === 'ar' ? 'مثال: الولايات المتحدة' : 'e.g., United States'}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-700 mb-2 block">{language === 'ar' ? 'تاريخ الانتهاء' : 'Expiry Date'}</label>
                    <input
                      type="date"
                      value={addForm.expiry_date}
                      onChange={(e) => setAddForm({ ...addForm, expiry_date: e.target.value })}
                      className="w-full bg-gray-50 px-4 py-3 rounded-2xl outline-none border-2 border-transparent focus:border-primary font-bold"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="text-sm font-bold text-gray-700 mb-2 block">{language === 'ar' ? 'تاريخ الإنتاج' : 'Manufacture Date'}</label>
                  <input
                    type="date"
                    value={addForm.manufacture_date}
                    onChange={(e) => setAddForm({ ...addForm, manufacture_date: e.target.value })}
                    className="w-full bg-gray-50 px-4 py-3 rounded-2xl outline-none border-2 border-transparent focus:border-primary font-bold"
                  />
                </div>

                <div className="mb-4">
                  <label className="text-sm font-bold text-gray-700 mb-2 block">{language === 'ar' ? 'المكونات' : 'Ingredients'}</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newIngredient}
                      onChange={(e) => setNewIngredient(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (newIngredient.trim()) {
                            setAddForm({ ...addForm, ingredients: [...addForm.ingredients, newIngredient.trim()] });
                            setNewIngredient('');
                          }
                        }
                      }}
                      placeholder={language === 'ar' ? 'أضف مكون...' : 'Add ingredient...'}
                      className="flex-1 bg-gray-50 px-4 py-3 rounded-2xl outline-none border-2 border-transparent focus:border-primary font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newIngredient.trim()) {
                          setAddForm({ ...addForm, ingredients: [...addForm.ingredients, newIngredient.trim()] });
                          setNewIngredient('');
                        }
                      }}
                      className="px-4 py-3 bg-primary text-white rounded-2xl font-bold hover:bg-secondary transition-all"
                    >
                      {language === 'ar' ? 'إضافة' : 'Add'}
                    </button>
                  </div>
                  {addForm.ingredients.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {addForm.ingredients.map((ing, idx) => (
                        <span key={idx} className="px-3 py-1 bg-accent rounded-xl text-sm font-bold flex items-center gap-2">
                          {ing}
                          <button
                            type="button"
                            onClick={() => setAddForm({ ...addForm, ingredients: addForm.ingredients.filter((_, i) => i !== idx) })}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-sm font-bold text-gray-700 mb-2 block">{language === 'ar' ? 'طريقة الاستخدام (عربي)' : 'Usage Instructions (Arabic)'}</label>
                    <textarea
                      value={addForm.usage_instructions_ar}
                      onChange={(e) => setAddForm({ ...addForm, usage_instructions_ar: e.target.value })}
                      rows={3}
                      className="w-full bg-gray-50 px-4 py-3 rounded-2xl outline-none border-2 border-transparent focus:border-primary font-bold"
                      placeholder={language === 'ar' ? 'مثال: اخلط ملعقة واحدة مع 250 مل من الماء...' : 'e.g., Mix one scoop with 250ml of water...'}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-700 mb-2 block">{language === 'ar' ? 'طريقة الاستخدام (إنجليزي)' : 'Usage Instructions (English)'}</label>
                    <textarea
                      value={addForm.usage_instructions_en}
                      onChange={(e) => setAddForm({ ...addForm, usage_instructions_en: e.target.value })}
                      rows={3}
                      className="w-full bg-gray-50 px-4 py-3 rounded-2xl outline-none border-2 border-transparent focus:border-primary font-bold"
                      placeholder="e.g., Mix one scoop with 250ml of water..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-bold text-gray-700 mb-2 block">{language === 'ar' ? 'تحذيرات السلامة (عربي)' : 'Safety Warnings (Arabic)'}</label>
                    <textarea
                      value={addForm.safety_warnings_ar}
                      onChange={(e) => setAddForm({ ...addForm, safety_warnings_ar: e.target.value })}
                      rows={3}
                      className="w-full bg-gray-50 px-4 py-3 rounded-2xl outline-none border-2 border-transparent focus:border-primary font-bold"
                      placeholder={language === 'ar' ? 'مثال: يُرجى استشارة الطبيب قبل الاستخدام...' : 'e.g., Please consult your doctor...'}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-700 mb-2 block">{language === 'ar' ? 'تحذيرات السلامة (إنجليزي)' : 'Safety Warnings (English)'}</label>
                    <textarea
                      value={addForm.safety_warnings_en}
                      onChange={(e) => setAddForm({ ...addForm, safety_warnings_en: e.target.value })}
                      rows={3}
                      className="w-full bg-gray-50 px-4 py-3 rounded-2xl outline-none border-2 border-transparent focus:border-primary font-bold"
                      placeholder="e.g., Please consult your doctor..."
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={addForm.is_active}
                    onChange={(e) => setAddForm({ ...addForm, is_active: e.target.checked })}
                    className="w-5 h-5 rounded"
                  />
                  <span className="text-sm font-bold text-gray-700">{t('active')}</span>
                </label>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={handleAddProduct}
                className="flex-1 bg-primary text-white py-3 rounded-2xl font-bold hover:bg-secondary transition-all"
              >
                {t('addProduct')}
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setAddForm({
                    name_ar: '',
                    name_en: '',
                    description_ar: '',
                    description_en: '',
                    price: '',
                    old_price: '',
                    category_id: '',
                    stock: '',
                    rating: '',
                    reviews_count: '',
                    weight: '',
                    flavors: [],
                    nutrition: [],
                    is_active: true,
                    country_of_origin: '',
                    expiry_date: '',
                    manufacture_date: '',
                    ingredients: [],
                    usage_instructions_ar: '',
                    usage_instructions_en: '',
                    safety_warnings_ar: '',
                    safety_warnings_en: ''
                  });
                  setAddImageFiles([]);
                  setAddImagePreviews([]);
                  setNewIngredient('');
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

      {/* Edit Product Modal - Similar structure to Add Modal */}
      {showEditModal && editingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-black mb-6">{t('editProductTitle')}</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 block">{t('nameArabic')} *</label>
                  <input
                    type="text"
                    value={editForm.name_ar}
                    onChange={(e) => setEditForm({ ...editForm, name_ar: e.target.value })}
                    className="w-full bg-gray-50 px-4 py-3 rounded-2xl outline-none border-2 border-transparent focus:border-primary font-bold"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 block">{t('nameEnglish')}</label>
                  <input
                    type="text"
                    value={editForm.name_en}
                    onChange={(e) => setEditForm({ ...editForm, name_en: e.target.value })}
                    className="w-full bg-gray-50 px-4 py-3 rounded-2xl outline-none border-2 border-transparent focus:border-primary font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 block">{t('price')} *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                    className="w-full bg-gray-50 px-4 py-3 rounded-2xl outline-none border-2 border-transparent focus:border-primary font-bold"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 block">{t('oldPrice')}</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.old_price}
                    onChange={(e) => setEditForm({ ...editForm, old_price: e.target.value })}
                    className="w-full bg-gray-50 px-4 py-3 rounded-2xl outline-none border-2 border-transparent focus:border-primary font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 block">{t('productCategory')}</label>
                  <select
                    value={editForm.category_id}
                    onChange={(e) => setEditForm({ ...editForm, category_id: e.target.value })}
                    className="w-full bg-gray-50 px-4 py-3 rounded-2xl outline-none border-2 border-transparent focus:border-primary font-bold"
                  >
                    <option value="">{t('all')}</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{language === 'ar' ? cat.name : (cat.name_en || cat.name)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 block">{t('stock')}</label>
                  <input
                    type="number"
                    value={editForm.stock}
                    onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })}
                    className="w-full bg-gray-50 px-4 py-3 rounded-2xl outline-none border-2 border-transparent focus:border-primary font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-gray-700 mb-2 block">{t('productImage')} ({language === 'ar' ? 'يمكن رفع عدة صور' : 'Multiple images allowed'})</label>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  multiple
                  onChange={(e) => handleImageChange(e.target.files, 'edit')}
                  className="w-full bg-gray-50 px-4 py-3 rounded-2xl outline-none border-2 border-transparent focus:border-primary font-bold file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-primary file:text-white hover:file:bg-secondary cursor-pointer"
                />
                {imageErrors.edit && (
                  <p className="text-red-500 text-sm mt-1 font-bold">{imageErrors.edit}</p>
                )}
                
                {/* Current Product Images */}
                {productImages.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs text-gray-500 mb-2 font-bold">{language === 'ar' ? 'الصور الحالية:' : 'Current Images:'}</p>
                    <div className="grid grid-cols-4 gap-4">
                      {productImages.map((img) => (
                        <div key={img.id} className="relative">
                          <img 
                            src={img.url} 
                            alt="Product" 
                            className="w-full h-32 object-cover rounded-xl border-2 border-gray-200"
                          />
                          {img.is_primary && (
                            <div className="absolute top-2 right-2 bg-primary text-white text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1">
                              <Star size={12} fill="currentColor" />
                              {language === 'ar' ? 'رئيسية' : 'Primary'}
                            </div>
                          )}
                          <div className="absolute bottom-2 left-2 right-2 flex gap-1">
                            {!img.is_primary && (
                              <button
                                type="button"
                                onClick={() => handleSetPrimaryImage(img.id)}
                                className="flex-1 bg-blue-500 text-white text-xs px-2 py-1 rounded-lg hover:bg-blue-600 font-bold"
                                title={language === 'ar' ? 'تعيين كصورة رئيسية' : 'Set as primary'}
                              >
                                {language === 'ar' ? 'رئيسية' : 'Primary'}
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDeleteImage(img.id)}
                              className="flex-1 bg-red-500 text-white text-xs px-2 py-1 rounded-lg hover:bg-red-600 font-bold"
                              title={language === 'ar' ? 'حذف' : 'Delete'}
                            >
                              <Trash2 size={12} className="mx-auto" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* New Image Previews */}
                {editImagePreviews.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs text-gray-500 mb-2 font-bold">{language === 'ar' ? 'الصور الجديدة:' : 'New Images:'}</p>
                    <div className="grid grid-cols-4 gap-4">
                      {editImagePreviews.map((preview, index) => (
                        <div key={index} className="relative">
                          <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-32 object-cover rounded-xl border-2 border-gray-200" />
                          <button
                            type="button"
                            onClick={() => removeImage(index, 'edit')}
                            className="absolute top-2 left-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Additional Details Section */}
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h3 className="text-lg font-black mb-4">{language === 'ar' ? 'تفاصيل إضافية' : 'Additional Details'}</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-sm font-bold text-gray-700 mb-2 block">{language === 'ar' ? 'بلد الصنع' : 'Country of Origin'}</label>
                    <input
                      type="text"
                      value={editForm.country_of_origin}
                      onChange={(e) => setEditForm({ ...editForm, country_of_origin: e.target.value })}
                      className="w-full bg-gray-50 px-4 py-3 rounded-2xl outline-none border-2 border-transparent focus:border-primary font-bold"
                      placeholder={language === 'ar' ? 'مثال: الولايات المتحدة' : 'e.g., United States'}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-700 mb-2 block">{language === 'ar' ? 'تاريخ الانتهاء' : 'Expiry Date'}</label>
                    <input
                      type="date"
                      value={editForm.expiry_date}
                      onChange={(e) => setEditForm({ ...editForm, expiry_date: e.target.value })}
                      className="w-full bg-gray-50 px-4 py-3 rounded-2xl outline-none border-2 border-transparent focus:border-primary font-bold"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="text-sm font-bold text-gray-700 mb-2 block">{language === 'ar' ? 'تاريخ الإنتاج' : 'Manufacture Date'}</label>
                  <input
                    type="date"
                    value={editForm.manufacture_date}
                    onChange={(e) => setEditForm({ ...editForm, manufacture_date: e.target.value })}
                    className="w-full bg-gray-50 px-4 py-3 rounded-2xl outline-none border-2 border-transparent focus:border-primary font-bold"
                  />
                </div>

                <div className="mb-4">
                  <label className="text-sm font-bold text-gray-700 mb-2 block">{language === 'ar' ? 'المكونات' : 'Ingredients'}</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newIngredient}
                      onChange={(e) => setNewIngredient(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (newIngredient.trim()) {
                            setEditForm({ ...editForm, ingredients: [...editForm.ingredients, newIngredient.trim()] });
                            setNewIngredient('');
                          }
                        }
                      }}
                      placeholder={language === 'ar' ? 'أضف مكون...' : 'Add ingredient...'}
                      className="flex-1 bg-gray-50 px-4 py-3 rounded-2xl outline-none border-2 border-transparent focus:border-primary font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newIngredient.trim()) {
                          setEditForm({ ...editForm, ingredients: [...editForm.ingredients, newIngredient.trim()] });
                          setNewIngredient('');
                        }
                      }}
                      className="px-4 py-3 bg-primary text-white rounded-2xl font-bold hover:bg-secondary transition-all"
                    >
                      {language === 'ar' ? 'إضافة' : 'Add'}
                    </button>
                  </div>
                  {editForm.ingredients.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {editForm.ingredients.map((ing, idx) => (
                        <span key={idx} className="px-3 py-1 bg-accent rounded-xl text-sm font-bold flex items-center gap-2">
                          {ing}
                          <button
                            type="button"
                            onClick={() => setEditForm({ ...editForm, ingredients: editForm.ingredients.filter((_, i) => i !== idx) })}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-sm font-bold text-gray-700 mb-2 block">{language === 'ar' ? 'طريقة الاستخدام (عربي)' : 'Usage Instructions (Arabic)'}</label>
                    <textarea
                      value={editForm.usage_instructions_ar}
                      onChange={(e) => setEditForm({ ...editForm, usage_instructions_ar: e.target.value })}
                      rows={3}
                      className="w-full bg-gray-50 px-4 py-3 rounded-2xl outline-none border-2 border-transparent focus:border-primary font-bold"
                      placeholder={language === 'ar' ? 'مثال: اخلط ملعقة واحدة مع 250 مل من الماء...' : 'e.g., Mix one scoop with 250ml of water...'}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-700 mb-2 block">{language === 'ar' ? 'طريقة الاستخدام (إنجليزي)' : 'Usage Instructions (English)'}</label>
                    <textarea
                      value={editForm.usage_instructions_en}
                      onChange={(e) => setEditForm({ ...editForm, usage_instructions_en: e.target.value })}
                      rows={3}
                      className="w-full bg-gray-50 px-4 py-3 rounded-2xl outline-none border-2 border-transparent focus:border-primary font-bold"
                      placeholder="e.g., Mix one scoop with 250ml of water..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-bold text-gray-700 mb-2 block">{language === 'ar' ? 'تحذيرات السلامة (عربي)' : 'Safety Warnings (Arabic)'}</label>
                    <textarea
                      value={editForm.safety_warnings_ar}
                      onChange={(e) => setEditForm({ ...editForm, safety_warnings_ar: e.target.value })}
                      rows={3}
                      className="w-full bg-gray-50 px-4 py-3 rounded-2xl outline-none border-2 border-transparent focus:border-primary font-bold"
                      placeholder={language === 'ar' ? 'مثال: يُرجى استشارة الطبيب قبل الاستخدام...' : 'e.g., Please consult your doctor...'}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-700 mb-2 block">{language === 'ar' ? 'تحذيرات السلامة (إنجليزي)' : 'Safety Warnings (English)'}</label>
                    <textarea
                      value={editForm.safety_warnings_en}
                      onChange={(e) => setEditForm({ ...editForm, safety_warnings_en: e.target.value })}
                      rows={3}
                      className="w-full bg-gray-50 px-4 py-3 rounded-2xl outline-none border-2 border-transparent focus:border-primary font-bold"
                      placeholder="e.g., Please consult your doctor..."
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.is_active}
                    onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
                    className="w-5 h-5 rounded"
                  />
                  <span className="text-sm font-bold text-gray-700">{t('active')}</span>
                </label>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={handleUpdateProduct}
                className="flex-1 bg-primary text-white py-3 rounded-2xl font-bold hover:bg-secondary transition-all"
              >
                {t('saveChanges')}
              </button>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingProduct(null);
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

export default AdminProducts;
