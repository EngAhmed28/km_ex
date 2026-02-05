import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { goalsAPI, dashboardAPI, productsAPI } from '../utils/api';
import { Target, Search, Edit, Trash2, Plus, CheckCircle, XCircle, Flame, Trophy, Zap, Package, X } from 'lucide-react';

interface AdminGoalsProps {
  onNavigate: (page: string) => void;
}

interface Goal {
  id: number;
  title_ar: string;
  title_en: string;
  icon_name: string;
  color_gradient: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

const AdminGoals: React.FC<AdminGoalsProps> = ({ onNavigate }) => {
  const { user: currentUser } = useAuth();
  const { language } = useLanguage();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [addForm, setAddForm] = useState({ title_ar: '', title_en: '', icon_name: 'flame', color_gradient: 'bg-red-600', display_order: 0, is_active: true });
  const [editForm, setEditForm] = useState({ title_ar: '', title_en: '', icon_name: 'flame', color_gradient: 'bg-red-600', display_order: 0, is_active: true });
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [canCreate, setCanCreate] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [canDelete, setCanDelete] = useState(false);
  const [showProductsModal, setShowProductsModal] = useState(false);
  const [selectedGoalForProducts, setSelectedGoalForProducts] = useState<Goal | null>(null);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const iconMap: { [key: string]: any } = {
    flame: Flame,
    target: Target,
    zap: Zap,
    trophy: Trophy,
  };

  const colorOptions = [
    { value: 'bg-red-600', label: language === 'ar' ? 'أحمر' : 'Red' },
    { value: 'bg-blue-600', label: language === 'ar' ? 'أزرق' : 'Blue' },
    { value: 'bg-yellow-600', label: language === 'ar' ? 'أصفر' : 'Yellow' },
    { value: 'bg-emerald-600', label: language === 'ar' ? 'أخضر' : 'Green' },
    { value: 'bg-purple-600', label: language === 'ar' ? 'بنفسجي' : 'Purple' },
    { value: 'bg-orange-600', label: language === 'ar' ? 'برتقالي' : 'Orange' },
  ];

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    if (currentUser?.role === 'admin') {
      setHasPermission(true);
      setCanCreate(true);
      setCanEdit(true);
      setCanDelete(true);
      fetchGoals();
      return;
    }

    if (currentUser?.role === 'employee') {
      try {
        const response = await dashboardAPI.getDashboard();
        if (response.success && response.data?.permissions) {
          const perm = response.data.permissions.find((p: any) =>
            p.permission_type === 'goals' && (p.can_view === true || p.can_view === 1 || p.can_view === '1')
          );
          if (perm) {
            setHasPermission(true);
            setCanCreate(perm.can_create === true || perm.can_create === 1 || perm.can_create === '1');
            setCanEdit(perm.can_edit === true || perm.can_edit === 1 || perm.can_edit === '1');
            setCanDelete(perm.can_delete === true || perm.can_delete === 1 || perm.can_delete === '1');
            fetchGoals();
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

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const response = await goalsAPI.getAllGoals();
      if (response.success && response.data?.goals) {
        setGoals(response.data.goals);
      } else {
        setError(response.message || 'فشل تحميل الأهداف');
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ في الشبكة');
    } finally {
      setLoading(false);
    }
  };

  const handleAddGoal = async () => {
    if (!addForm.title_ar || !addForm.title_en || !addForm.icon_name || !addForm.color_gradient) {
      alert(language === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields');
      return;
    }

    try {
      const response = await goalsAPI.createGoal(addForm);
      if (response.success) {
        setShowAddModal(false);
        setAddForm({ title_ar: '', title_en: '', icon_name: 'flame', color_gradient: 'bg-red-600', display_order: 0, is_active: true });
        fetchGoals();
        alert(language === 'ar' ? 'تم إضافة الهدف بنجاح' : 'Goal added successfully');
      }
    } catch (err: any) {
      alert(err.message || (language === 'ar' ? 'فشل إضافة الهدف' : 'Failed to add goal'));
    }
  };

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setEditForm({
      title_ar: goal.title_ar,
      title_en: goal.title_en,
      icon_name: goal.icon_name,
      color_gradient: goal.color_gradient,
      display_order: goal.display_order,
      is_active: goal.is_active
    });
    setShowEditModal(true);
  };

  const handleUpdateGoal = async () => {
    if (!editingGoal || !editForm.title_ar || !editForm.title_en || !editForm.icon_name || !editForm.color_gradient) {
      alert(language === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields');
      return;
    }

    try {
      const response = await goalsAPI.updateGoal(editingGoal.id, editForm);
      if (response.success) {
        setShowEditModal(false);
        setEditingGoal(null);
        fetchGoals();
        alert(language === 'ar' ? 'تم تحديث الهدف بنجاح' : 'Goal updated successfully');
      }
    } catch (err: any) {
      alert(err.message || (language === 'ar' ? 'فشل تحديث الهدف' : 'Failed to update goal'));
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذا الهدف؟' : 'Are you sure you want to delete this goal?')) {
      return;
    }

    try {
      const response = await goalsAPI.deleteGoal(id);
      if (response.success) {
        fetchGoals();
        alert(language === 'ar' ? 'تم حذف الهدف بنجاح' : 'Goal deleted successfully');
      }
    } catch (err: any) {
      alert(err.message || (language === 'ar' ? 'فشل حذف الهدف' : 'Failed to delete goal'));
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      const response = await goalsAPI.toggleGoalStatus(id);
      if (response.success) {
        fetchGoals();
      }
    } catch (err: any) {
      alert(err.message || (language === 'ar' ? 'فشل تغيير حالة الهدف' : 'Failed to toggle goal status'));
    }
  };

  const handleManageProducts = async (goal: Goal) => {
    setSelectedGoalForProducts(goal);
    setLoadingProducts(true);
    try {
      // Fetch all products
      const productsResponse = await productsAPI.getAllProducts({ show_all: true });
      if (productsResponse.success && productsResponse.data?.products) {
        setAllProducts(productsResponse.data.products);
      }

      // Fetch linked products
      const linkedResponse = await goalsAPI.getGoalProducts(goal.id);
      if (linkedResponse.success && linkedResponse.data?.products) {
        // Convert all IDs to numbers for consistent comparison
        const linkedIds = linkedResponse.data.products.map((p: any) => {
          const id = typeof p.id === 'string' ? parseInt(p.id) : p.id;
          return isNaN(id) ? p.id : id;
        });
        setSelectedProductIds(linkedIds);
      } else {
        setSelectedProductIds([]);
      }
      setShowProductsModal(true);
    } catch (err: any) {
      alert(err.message || (language === 'ar' ? 'فشل تحميل المنتجات' : 'Failed to load products'));
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleSaveProducts = async () => {
    if (!selectedGoalForProducts) return;

    try {
      // Ensure all IDs are numbers
      const normalizedIds = selectedProductIds.map(id => typeof id === 'string' ? parseInt(id) : id).filter(id => !isNaN(id));
      const response = await goalsAPI.updateGoalProducts(selectedGoalForProducts.id, normalizedIds);
      if (response.success) {
        setShowProductsModal(false);
        setSelectedGoalForProducts(null);
        alert(language === 'ar' ? 'تم حفظ المنتجات بنجاح' : 'Products saved successfully');
      }
    } catch (err: any) {
      alert(err.message || (language === 'ar' ? 'فشل حفظ المنتجات' : 'Failed to save products'));
    }
  };

  const toggleProductSelection = (productId: number | string) => {
    const id = typeof productId === 'string' ? parseInt(productId) : productId;
    setSelectedProductIds(prev => {
      // Normalize all IDs to numbers for comparison
      const normalizedPrev = prev.map(p => typeof p === 'string' ? parseInt(p) : p);
      const normalizedId = typeof id === 'string' ? parseInt(id) : id;
      
      return normalizedPrev.includes(normalizedId)
        ? normalizedPrev.filter(p => {
            const normalizedP = typeof p === 'string' ? parseInt(p) : p;
            return normalizedP !== normalizedId;
          })
        : [...normalizedPrev, normalizedId];
    });
  };

  const filteredGoals = goals.filter(goal =>
    goal.title_ar.toLowerCase().includes(searchTerm.toLowerCase()) ||
    goal.title_en.toLowerCase().includes(searchTerm.toLowerCase())
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
        <h2 className="text-2xl font-black">{language === 'ar' ? 'إدارة الأهداف' : 'Goals Management'}</h2>
        {(currentUser?.role === 'admin' || canCreate) && (
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-primary text-white px-6 py-3 rounded-2xl font-bold hover:bg-secondary transition-all flex items-center gap-2"
          >
            <Plus size={20} /> {language === 'ar' ? 'إضافة هدف' : 'Add Goal'}
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
        <div className="relative">
          <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder={language === 'ar' ? 'بحث عن هدف...' : 'Search goals...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-12 pl-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredGoals.map((goal) => {
          const IconComponent = iconMap[goal.icon_name] || Target;
          return (
            <div key={goal.id} className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="relative h-64 rounded-2xl overflow-hidden mb-4 group cursor-pointer">
                <div className={`absolute inset-0 ${goal.color_gradient} opacity-90 group-hover:opacity-100 transition-opacity`}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                <div className="absolute inset-0 p-6 flex flex-col justify-between text-white">
                  <div className="bg-white/20 w-16 h-16 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/30">
                    <IconComponent size={32} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black italic uppercase leading-none mb-2">
                      {language === 'ar' ? goal.title_ar : goal.title_en}
                    </h3>
                  </div>
                </div>
                <div className="absolute top-4 right-4 flex gap-2">
                  {(currentUser?.role === 'admin' || canEdit) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(goal);
                      }}
                      className="bg-white/20 backdrop-blur-md text-white p-2 rounded-lg hover:bg-white/30 transition-all"
                    >
                      <Edit size={16} />
                    </button>
                  )}
                  {(currentUser?.role === 'admin' || canDelete) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(goal.id);
                      }}
                      className="bg-white/20 backdrop-blur-md text-white p-2 rounded-lg hover:bg-white/30 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{language === 'ar' ? 'ترتيب العرض:' : 'Display Order:'} {goal.display_order}</span>
                  <button
                    onClick={() => handleToggleStatus(goal.id)}
                    className={`p-2 rounded-xl transition-all ${
                      goal.is_active
                        ? 'bg-green-100 text-green-600 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {goal.is_active ? <CheckCircle size={20} /> : <XCircle size={20} />}
                  </button>
                </div>
                {(currentUser?.role === 'admin' || canEdit) && (
                  <button
                    onClick={() => handleManageProducts(goal)}
                    className="w-full bg-primary text-white px-4 py-2 rounded-xl font-bold hover:bg-secondary transition-all flex items-center justify-center gap-2"
                  >
                    <Package size={16} />
                    {language === 'ar' ? 'إدارة المنتجات' : 'Manage Products'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-2xl font-black mb-4">{language === 'ar' ? 'إضافة هدف جديد' : 'Add New Goal'}</h3>
            <div className="space-y-4">
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
              <div>
                <label className="block text-sm font-bold mb-2">{language === 'ar' ? 'اسم الأيقونة *' : 'Icon Name *'}</label>
                <select
                  value={addForm.icon_name}
                  onChange={(e) => setAddForm({ ...addForm, icon_name: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
                >
                  <option value="flame">{language === 'ar' ? 'شعلة' : 'Flame'}</option>
                  <option value="target">{language === 'ar' ? 'هدف' : 'Target'}</option>
                  <option value="zap">{language === 'ar' ? 'برق' : 'Zap'}</option>
                  <option value="trophy">{language === 'ar' ? 'كأس' : 'Trophy'}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">{language === 'ar' ? 'اللون *' : 'Color *'}</label>
                <select
                  value={addForm.color_gradient}
                  onChange={(e) => setAddForm({ ...addForm, color_gradient: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
                >
                  {colorOptions.map((color) => (
                    <option key={color.value} value={color.value}>{color.label}</option>
                  ))}
                </select>
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
                onClick={handleAddGoal}
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
      {showEditModal && editingGoal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-2xl font-black mb-4">{language === 'ar' ? 'تعديل الهدف' : 'Edit Goal'}</h3>
            <div className="space-y-4">
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
              <div>
                <label className="block text-sm font-bold mb-2">{language === 'ar' ? 'اسم الأيقونة *' : 'Icon Name *'}</label>
                <select
                  value={editForm.icon_name}
                  onChange={(e) => setEditForm({ ...editForm, icon_name: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
                >
                  <option value="flame">{language === 'ar' ? 'شعلة' : 'Flame'}</option>
                  <option value="target">{language === 'ar' ? 'هدف' : 'Target'}</option>
                  <option value="zap">{language === 'ar' ? 'برق' : 'Zap'}</option>
                  <option value="trophy">{language === 'ar' ? 'كأس' : 'Trophy'}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">{language === 'ar' ? 'اللون *' : 'Color *'}</label>
                <select
                  value={editForm.color_gradient}
                  onChange={(e) => setEditForm({ ...editForm, color_gradient: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
                >
                  {colorOptions.map((color) => (
                    <option key={color.value} value={color.value}>{color.label}</option>
                  ))}
                </select>
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
                onClick={handleUpdateGoal}
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

      {/* Products Management Modal */}
      {showProductsModal && selectedGoalForProducts && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-black">
                {language === 'ar' 
                  ? `إدارة المنتجات - ${selectedGoalForProducts.title_ar}`
                  : `Manage Products - ${selectedGoalForProducts.title_en}`
                }
              </h3>
              <button
                onClick={() => {
                  setShowProductsModal(false);
                  setSelectedGoalForProducts(null);
                  setSelectedProductIds([]);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all"
              >
                <X size={24} />
              </button>
            </div>
            
            {loadingProducts ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-lg font-bold">{language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</div>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {allProducts.map((product) => {
                      // Convert product.id to number for comparison (products from getAllProducts have id as string)
                      const productId = typeof product.id === 'string' ? parseInt(product.id) : product.id;
                      // Check if product is selected (handle both string and number IDs)
                      const isSelected = selectedProductIds.some(id => {
                        const normalizedId = typeof id === 'string' ? parseInt(id) : id;
                        const normalizedProductId = typeof productId === 'string' ? parseInt(productId) : productId;
                        return normalizedId === normalizedProductId;
                      });
                      return (
                        <div
                          key={product.id}
                          onClick={() => toggleProductSelection(product.id)}
                          className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            isSelected
                              ? 'border-primary bg-primary/10'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleProductSelection(productId)}
                              className="mt-1 w-5 h-5"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-sm mb-1">
                                <div className="truncate" title={`${language === 'ar' 
                                  ? (product.nameAr || product.name_ar || product.name || product.nameEn || product.name_en || `منتج #${product.id}`)
                                  : (product.nameEn || product.name_en || product.name || product.nameAr || product.name_ar || `Product #${product.id}`)
                                }${product.weight && !(product.nameAr || product.name_ar || product.name || product.nameEn || product.name_en || '').includes(product.weight) ? ` - ${product.weight}` : ''}`}>
                                  {/* Display name based on current language */}
                                  {(() => {
                                    const productName = language === 'ar'
                                      ? ((product.nameAr && product.nameAr.trim()) || 
                                         (product.name_ar && product.name_ar.trim()) || 
                                         (product.name && product.name.trim()) || 
                                         (product.nameEn && product.nameEn.trim()) || 
                                         (product.name_en && product.name_en.trim()) || 
                                         `منتج #${product.id}`)
                                      : ((product.nameEn && product.nameEn.trim()) || 
                                         (product.name_en && product.name_en.trim()) || 
                                         (product.name && product.name.trim()) || 
                                         (product.nameAr && product.nameAr.trim()) || 
                                         (product.name_ar && product.name_ar.trim()) || 
                                         `Product #${product.id}`);
                                    const weight = product.weight && product.weight.trim();
                                    // Only add weight if it's not already in the product name
                                    const nameIncludesWeight = weight && productName.includes(weight);
                                    return nameIncludesWeight ? productName : (productName + (weight ? ` - ${weight}` : ''));
                                  })()}
                                </div>
                              </div>
                              <div className="text-xs text-gray-500 mb-1 font-mono">
                                {product.category_slug || product.categorySlug || product.category || product.category_name_en || product.categoryNameEn || product.category_name || product.categoryName || (language === 'ar' ? 'بدون قسم' : 'No Category')}
                              </div>
                              <div className="text-xs font-semibold text-primary">
                                {product.price ? `${product.price} ${language === 'ar' ? 'ج.م' : 'EGP'}` : (language === 'ar' ? 'لا يوجد سعر' : 'No Price')}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {allProducts.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      {language === 'ar' ? 'لا توجد منتجات متاحة' : 'No products available'}
                    </div>
                  )}
                </div>
                <div className="flex gap-4 pt-4 border-t">
                  <button
                    onClick={handleSaveProducts}
                    className="flex-1 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-secondary transition-all"
                  >
                    {language === 'ar' ? 'حفظ' : 'Save'}
                  </button>
                  <button
                    onClick={() => {
                      setShowProductsModal(false);
                      setSelectedGoalForProducts(null);
                      setSelectedProductIds([]);
                    }}
                    className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-300 transition-all"
                  >
                    {language === 'ar' ? 'إلغاء' : 'Cancel'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGoals;
