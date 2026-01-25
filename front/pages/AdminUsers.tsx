import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { apiRequest } from '../utils/api';
import { Users, Search, Edit, Trash2, Shield, UserCheck, UserX, Plus } from 'lucide-react';

interface AdminUsersProps {
  onNavigate: (page: string) => void;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'employee' | 'customer';
  is_active?: boolean;
  created_at: string;
}

const AdminUsers: React.FC<AdminUsersProps> = ({ onNavigate }) => {
  const { user: currentUser } = useAuth();
  const { language, t } = useLanguage();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '' });
  const [addForm, setAddForm] = useState({ name: '', email: '', password: '', role: 'customer' });

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter, searchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(roleFilter !== 'all' && { role: roleFilter }),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await apiRequest(`/admin/users?${params}`, {
        method: 'GET'
      });

      if (response.success) {
        setUsers(response.data.users);
        setTotalPages(response.data.pagination.pages);
      }
    } catch (err: any) {
      setError(err.message || (language === 'ar' ? 'فشل تحميل المستخدمين' : 'Failed to load users'));
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      const response = await apiRequest(`/admin/users/${userId}/role`, {
        method: 'PUT',
        body: { role: newRole }
      });

      if (response.success) {
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole as any } : u));
        alert(language === 'ar' ? 'تم تحديث دور المستخدم بنجاح' : 'User role updated successfully');
      }
    } catch (err: any) {
      alert(err.message || (language === 'ar' ? 'فشل تحديث دور المستخدم' : 'Failed to update user role'));
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setEditForm({ name: user.name, email: user.email });
    setShowEditModal(true);
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    try {
      const response = await apiRequest(`/admin/users/${editingUser.id}`, {
        method: 'PUT',
        body: editForm
      });

      if (response.success) {
        setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...editForm } : u));
        setShowEditModal(false);
        setEditingUser(null);
        alert(language === 'ar' ? 'تم تحديث بيانات المستخدم بنجاح' : 'User updated successfully');
      }
    } catch (err: any) {
      alert(err.message || (language === 'ar' ? 'فشل تحديث بيانات المستخدم' : 'Failed to update user'));
    }
  };

  const handleToggleStatus = async (userId: number) => {
    try {
      const response = await apiRequest(`/admin/users/${userId}/toggle-status`, {
        method: 'PUT'
      });

      if (response.success) {
        setUsers(users.map(u => 
          u.id === userId ? { ...u, is_active: response.data.is_active } : u
        ));
        alert(response.message);
      }
    } catch (err: any) {
      alert(err.message || (language === 'ar' ? 'فشل تغيير حالة المستخدم' : 'Failed to change user status'));
    }
  };

  const handleAddUser = async () => {
    if (!addForm.name || !addForm.email || !addForm.password) {
      alert(language === 'ar' ? 'يرجى ملء جميع الحقول' : 'Please fill all fields');
      return;
    }

    if (addForm.password.length < 6) {
      alert(language === 'ar' ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters');
      return;
    }

    try {
      // Register user first
      const registerResponse = await apiRequest('/auth/register', {
        method: 'POST',
        body: {
          name: addForm.name,
          email: addForm.email,
          password: addForm.password
        }
      });

      if (registerResponse.success && registerResponse.data?.user?.id) {
        const userId = registerResponse.data.user.id;
        
        // Update role if needed (if not customer)
        if (addForm.role !== 'customer') {
          await apiRequest(`/admin/users/${userId}/role`, {
            method: 'PUT',
            body: { role: addForm.role }
          });
        }
        
        setShowAddModal(false);
        setAddForm({ name: '', email: '', password: '', role: 'customer' });
        fetchUsers(); // Refresh the list
        alert(language === 'ar' ? 'تم إضافة المستخدم بنجاح' : 'User added successfully');
      } else {
        alert(language === 'ar' ? 'فشل إضافة المستخدم - لم يتم الحصول على معرف المستخدم' : 'Failed to add user - User ID not received');
      }
    } catch (err: any) {
      alert(err.message || (language === 'ar' ? 'فشل إضافة المستخدم' : 'Failed to add user'));
    }
  };

  const handleDelete = async (userId: number) => {
    if (!confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذا المستخدم؟' : 'Are you sure you want to delete this user?')) return;

    try {
      const response = await apiRequest(`/admin/users/${userId}`, {
        method: 'DELETE'
      });

      if (response.success) {
        setUsers(users.filter(u => u.id !== userId));
        alert(language === 'ar' ? 'تم حذف المستخدم بنجاح' : 'User deleted successfully');
      }
    } catch (err: any) {
      alert(err.message || (language === 'ar' ? 'فشل حذف المستخدم' : 'Failed to delete user'));
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-700';
      case 'employee':
        return 'bg-blue-100 text-blue-700';
      case 'customer':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getRoleLabel = (role: string) => {
    if (language === 'ar') {
      switch (role) {
        case 'admin':
          return 'مدير';
        case 'employee':
          return 'موظف';
        case 'customer':
          return 'عميل';
        default:
          return role;
      }
    } else {
      switch (role) {
        case 'admin':
          return 'Admin';
        case 'employee':
          return 'Employee';
        case 'customer':
          return 'Customer';
        default:
          return role;
      }
    }
  };

  const filteredUsers = users;

  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl font-bold">{language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</div>
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
              <h1 className="text-3xl font-black mb-2">{t('userManagement')}</h1>
              <p className="text-gray-500 font-bold">{t('manageAllUsers')}</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-primary text-white px-6 py-3 rounded-2xl font-bold hover:bg-secondary transition-all flex items-center gap-2"
              >
                <Plus size={20} />
                {t('addUser')}
              </button>
              <button
                onClick={() => onNavigate('admin-dashboard')}
                className="bg-gray-100 text-gray-700 px-6 py-3 rounded-2xl font-bold hover:bg-gray-200 transition-all"
              >
                {t('backToDashboard')}
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder={t('searchUser')}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-gray-50 pr-12 pl-4 py-3 rounded-2xl outline-none border-2 border-transparent focus:border-primary font-bold"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="bg-gray-50 px-4 py-3 rounded-2xl outline-none border-2 border-transparent focus:border-primary font-bold"
            >
              <option value="all">{language === 'ar' ? 'جميع الأدوار' : 'All Roles'}</option>
              <option value="admin">{getRoleLabel('admin')}</option>
              <option value="employee">{getRoleLabel('employee')}</option>
              <option value="customer">{getRoleLabel('customer')}</option>
            </select>
            <div className="text-right flex items-center">
              <span className="text-gray-500 font-bold">
                {language === 'ar' ? `إجمالي: ${users.length} مستخدم` : `Total: ${users.length} users`}
              </span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 font-bold border border-red-100">
            {error}
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-right text-sm font-black text-gray-700">#</th>
                  <th className="px-6 py-4 text-right text-sm font-black text-gray-700">{language === 'ar' ? 'الاسم' : 'Name'}</th>
                  <th className="px-6 py-4 text-right text-sm font-black text-gray-700">{language === 'ar' ? 'البريد الإلكتروني' : 'Email'}</th>
                  <th className="px-6 py-4 text-right text-sm font-black text-gray-700">{language === 'ar' ? 'الدور' : 'Role'}</th>
                  <th className="px-6 py-4 text-right text-sm font-black text-gray-700">{t('status')}</th>
                  <th className="px-6 py-4 text-right text-sm font-black text-gray-700">{language === 'ar' ? 'تاريخ التسجيل' : 'Registration Date'}</th>
                  <th className="px-6 py-4 text-right text-sm font-black text-gray-700">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500 font-bold">
                      {language === 'ar' ? 'لا يوجد مستخدمين' : 'No users found'}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user, index) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-bold">{(page - 1) * 10 + index + 1}</td>
                      <td className="px-6 py-4 font-bold">{user.name}</td>
                      <td className="px-6 py-4 text-gray-600">{user.email}</td>
                      <td className="px-6 py-4">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          disabled={user.id === currentUser?.id}
                          className={`px-4 py-2 rounded-xl font-bold text-sm border-0 outline-none ${
                            getRoleBadgeColor(user.role)
                          } ${user.id === currentUser?.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          <option value="admin">{getRoleLabel('admin')}</option>
                          <option value="employee">{getRoleLabel('employee')}</option>
                          <option value="customer">{getRoleLabel('customer')}</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-xl text-xs font-bold ${
                          user.is_active !== false 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {user.is_active !== false ? t('active') : t('inactive')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm">
                        {new Date(user.created_at).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleEdit(user)}
                            className="bg-blue-100 text-blue-600 p-2 rounded-xl hover:bg-blue-200 transition-all"
                            title={t('edit')}
                          >
                            <Edit size={18} />
                          </button>
                          {user.id !== currentUser?.id && (
                            <>
                              <button
                                onClick={() => handleToggleStatus(user.id)}
                                className={`p-2 rounded-xl transition-all ${
                                  user.is_active !== false
                                    ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                                    : 'bg-green-100 text-green-600 hover:bg-green-200'
                                }`}
                                title={user.is_active !== false ? t('deactivate') : t('activate')}
                              >
                                {user.is_active !== false ? (
                                  <UserX size={18} />
                                ) : (
                                  <UserCheck size={18} />
                                )}
                              </button>
                              <button
                                onClick={() => handleDelete(user.id)}
                                className="bg-red-100 text-red-600 p-2 rounded-xl hover:bg-red-200 transition-all"
                                title={t('delete')}
                              >
                                <Trash2 size={18} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {language === 'ar' ? 'السابق' : 'Previous'}
              </button>
              <span className="text-gray-600 font-bold">
                {language === 'ar' ? `صفحة ${page} من ${totalPages}` : `Page ${page} of ${totalPages}`}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {language === 'ar' ? 'التالي' : 'Next'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-black mb-6">{language === 'ar' ? 'إضافة مستخدم جديد' : 'Add New User'}</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-gray-700 mb-2 block">الاسم</label>
                <input
                  type="text"
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  className="w-full bg-gray-50 px-4 py-3 rounded-2xl outline-none border-2 border-transparent focus:border-primary font-bold"
                  placeholder="اسم المستخدم"
                />
              </div>
              
              <div>
                <label className="text-sm font-bold text-gray-700 mb-2 block">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  className="w-full bg-gray-50 px-4 py-3 rounded-2xl outline-none border-2 border-transparent focus:border-primary font-bold"
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-gray-700 mb-2 block">{language === 'ar' ? 'كلمة المرور' : 'Password'}</label>
                <input
                  type="password"
                  value={addForm.password}
                  onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                  className="w-full bg-gray-50 px-4 py-3 rounded-2xl outline-none border-2 border-transparent focus:border-primary font-bold"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-gray-700 mb-2 block">{language === 'ar' ? 'الدور' : 'Role'}</label>
                <select
                  value={addForm.role}
                  onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                  className="w-full bg-gray-50 px-4 py-3 rounded-2xl outline-none border-2 border-transparent focus:border-primary font-bold"
                >
                  <option value="customer">{getRoleLabel('customer')}</option>
                  <option value="employee">{getRoleLabel('employee')}</option>
                  <option value="admin">{getRoleLabel('admin')}</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={handleAddUser}
                className="flex-1 bg-primary text-white py-3 rounded-2xl font-bold hover:bg-secondary transition-all"
              >
                {language === 'ar' ? 'إضافة المستخدم' : 'Add User'}
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setAddForm({ name: '', email: '', password: '', role: 'customer' });
                }}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-2xl font-bold hover:bg-gray-200 transition-all"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-black mb-6">{language === 'ar' ? 'تعديل بيانات المستخدم' : 'Edit User'}</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-gray-700 mb-2 block">{language === 'ar' ? 'الاسم' : 'Name'}</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full bg-gray-50 px-4 py-3 rounded-2xl outline-none border-2 border-transparent focus:border-primary font-bold"
                  placeholder={language === 'ar' ? 'اسم المستخدم' : 'User name'}
                />
              </div>
              
              <div>
                <label className="text-sm font-bold text-gray-700 mb-2 block">{language === 'ar' ? 'البريد الإلكتروني' : 'Email'}</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full bg-gray-50 px-4 py-3 rounded-2xl outline-none border-2 border-transparent focus:border-primary font-bold"
                  placeholder="email@example.com"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={handleUpdateUser}
                className="flex-1 bg-primary text-white py-3 rounded-2xl font-bold hover:bg-secondary transition-all"
              >
                {language === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
              </button>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingUser(null);
                }}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-2xl font-bold hover:bg-gray-200 transition-all"
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

export default AdminUsers;
