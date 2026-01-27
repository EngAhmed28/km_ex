import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { statsAPI, dashboardAPI } from '../utils/api';
import { BarChart3, Search, Edit, CheckCircle, XCircle, Flame, Trophy, Shield, Users } from 'lucide-react';

interface AdminStatsProps {
  onNavigate: (page: string) => void;
}

interface Stat {
  id: number;
  stat_key: string;
  stat_value: string;
  stat_label_ar: string;
  stat_label_en: string;
  icon_name?: string;
  display_order: number;
  is_active: boolean;
}

const AdminStats: React.FC<AdminStatsProps> = ({ onNavigate }) => {
  const { user: currentUser } = useAuth();
  const { language } = useLanguage();
  const [stats, setStats] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStat, setEditingStat] = useState<Stat | null>(null);
  const [editForm, setEditForm] = useState({ stat_value: '', stat_label_ar: '', stat_label_en: '', icon_name: '', display_order: 0, is_active: true });
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [canEdit, setCanEdit] = useState(false);

  const iconMap: { [key: string]: any } = {
    flame: Flame,
    trophy: Trophy,
    shield: Shield,
    users: Users,
  };

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    if (currentUser?.role === 'admin') {
      setHasPermission(true);
      setCanEdit(true);
      fetchStats();
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
            setCanEdit(perm.can_edit === true || perm.can_edit === 1 || perm.can_edit === '1');
            fetchStats();
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

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await statsAPI.getAllStats();
      if (response.success && response.data?.stats) {
        setStats(response.data.stats);
      } else {
        setError(response.message || 'فشل تحميل الإحصائيات');
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ في الشبكة');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (stat: Stat) => {
    setEditingStat(stat);
    setEditForm({
      stat_value: stat.stat_value,
      stat_label_ar: stat.stat_label_ar,
      stat_label_en: stat.stat_label_en,
      icon_name: stat.icon_name || '',
      display_order: stat.display_order,
      is_active: stat.is_active
    });
    setShowEditModal(true);
  };

  const handleUpdateStat = async () => {
    if (!editingStat || !editForm.stat_value || !editForm.stat_label_ar || !editForm.stat_label_en) {
      alert(language === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields');
      return;
    }

    try {
      const response = await statsAPI.updateStat(editingStat.id, editForm);
      if (response.success) {
        setShowEditModal(false);
        setEditingStat(null);
        fetchStats();
        alert(language === 'ar' ? 'تم تحديث الإحصائية بنجاح' : 'Stat updated successfully');
      }
    } catch (err: any) {
      alert(err.message || (language === 'ar' ? 'فشل تحديث الإحصائية' : 'Failed to update stat'));
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      const response = await statsAPI.toggleStatStatus(id);
      if (response.success) {
        fetchStats();
      }
    } catch (err: any) {
      alert(err.message || (language === 'ar' ? 'فشل تغيير حالة الإحصائية' : 'Failed to toggle stat status'));
    }
  };

  const filteredStats = stats.filter(stat =>
    stat.stat_label_ar.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stat.stat_label_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stat.stat_value.toLowerCase().includes(searchTerm.toLowerCase())
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
        <h2 className="text-2xl font-black">{language === 'ar' ? 'إدارة الإحصائيات' : 'Statistics Management'}</h2>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
        <div className="relative">
          <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder={language === 'ar' ? 'بحث عن إحصائية...' : 'Search stats...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-12 pl-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredStats.map((stat) => {
          const IconComponent = stat.icon_name && iconMap[stat.icon_name] ? iconMap[stat.icon_name] : BarChart3;
          return (
            <div key={stat.id} className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-red-100 p-4 rounded-xl">
                  <IconComponent className="text-red-500" size={24} />
                </div>
                {(currentUser?.role === 'admin' || canEdit) && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(stat)}
                      className="bg-blue-100 text-blue-600 p-2 rounded-xl hover:bg-blue-200 transition-all"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleToggleStatus(stat.id)}
                      className={`p-2 rounded-xl transition-all ${
                        stat.is_active
                          ? 'bg-green-100 text-green-600 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {stat.is_active ? <CheckCircle size={18} /> : <XCircle size={18} />}
                    </button>
                  </div>
                )}
              </div>
              <h3 className="text-3xl font-black mb-2">{stat.stat_value}</h3>
              <p className="text-gray-500 text-sm">{language === 'ar' ? stat.stat_label_ar : stat.stat_label_en}</p>
            </div>
          );
        })}
      </div>

      {/* Edit Modal */}
      {showEditModal && editingStat && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-2xl font-black mb-4">{language === 'ar' ? 'تعديل الإحصائية' : 'Edit Statistic'}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">{language === 'ar' ? 'القيمة' : 'Value'}</label>
                <input
                  type="text"
                  value={editForm.stat_value}
                  onChange={(e) => setEditForm({ ...editForm, stat_value: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
                  placeholder="4.9/5, +15, +200, +50k"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">{language === 'ar' ? 'التسمية (عربي)' : 'Label (Arabic)'}</label>
                <input
                  type="text"
                  value={editForm.stat_label_ar}
                  onChange={(e) => setEditForm({ ...editForm, stat_label_ar: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">{language === 'ar' ? 'التسمية (إنجليزي)' : 'Label (English)'}</label>
                <input
                  type="text"
                  value={editForm.stat_label_en}
                  onChange={(e) => setEditForm({ ...editForm, stat_label_en: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">{language === 'ar' ? 'اسم الأيقونة' : 'Icon Name'}</label>
                <select
                  value={editForm.icon_name}
                  onChange={(e) => setEditForm({ ...editForm, icon_name: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
                >
                  <option value="">{language === 'ar' ? 'اختر أيقونة' : 'Select Icon'}</option>
                  <option value="flame">{language === 'ar' ? 'شعلة' : 'Flame'}</option>
                  <option value="trophy">{language === 'ar' ? 'كأس' : 'Trophy'}</option>
                  <option value="shield">{language === 'ar' ? 'درع' : 'Shield'}</option>
                  <option value="users">{language === 'ar' ? 'مستخدمين' : 'Users'}</option>
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
                onClick={handleUpdateStat}
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

export default AdminStats;
