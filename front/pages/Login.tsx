
import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react';

interface LoginProps {
  onNavigate: (page: string, params?: any) => void;
  type?: 'login' | 'signup';
  initialEmail?: string;
}

const Login: React.FC<LoginProps> = ({ onNavigate, type = 'login', initialEmail }) => {
  const { t, language } = useLanguage();
  const { login, signup, user } = useAuth();
  const [isLogin, setIsLogin] = useState(type === 'login');
  const [showPass, setShowPass] = useState(false);
  const [formData, setFormData] = useState({ 
    name: '', 
    email: initialEmail || '', 
    pass: '', 
    confirmPass: '' 
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isLogin) {
      try {
        const success = await login(formData.email, formData.pass);
        if (success) {
          // Small delay to ensure user state is updated
          setTimeout(() => {
            const savedUser = localStorage.getItem('user');
            if (savedUser) {
              const userData = JSON.parse(savedUser);
              if (userData.role === 'admin') {
                onNavigate('admin-dashboard');
              } else {
                onNavigate('dashboard');
              }
            } else {
              onNavigate('home');
            }
          }, 100);
        } else {
          setError('خطأ في البريد الإلكتروني أو كلمة المرور');
        }
      } catch (error: any) {
        setError(error.message || 'خطأ في البريد الإلكتروني أو كلمة المرور');
        setLoading(false);
        return;
      }
    } else {
      if (formData.pass !== formData.confirmPass) {
        setError('كلمات المرور غير متطابقة');
        setLoading(false);
        return;
      }
      const success = await signup(formData.name, formData.email, formData.pass);
      if (success) {
        // New users are always customers, redirect to dashboard
        setTimeout(() => {
          onNavigate('dashboard');
        }, 100);
      } else {
        setError('فشل إنشاء الحساب، يرجى التحقق من البيانات');
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-[3rem] p-8 lg:p-12 shadow-2xl border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16"></div>
          
          <div className="text-center mb-10">
            <div className="bg-primary text-white w-16 h-16 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 text-3xl font-black rotate-12">K</div>
            <h1 className="text-3xl font-black italic uppercase mb-2">
              {isLogin ? t('login') : t('signup')}
            </h1>
            <p className="text-gray-400 font-bold text-sm">{t('welcomeBack')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-3 text-sm font-bold border border-red-100 animate-shake">
                <AlertCircle size={20} /> {error}
              </div>
            )}

            {!isLogin && (
              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-gray-500 tracking-widest px-1">{t('fullName')}</label>
                <div className="relative">
                  <input 
                    required
                    type="text" 
                    className="w-full bg-accent px-12 py-4 rounded-2xl outline-none border-2 border-transparent focus:border-primary font-bold transition-all"
                    placeholder="أحمد محمد"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                  <User className={`absolute ${language === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400`} size={20} />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-black uppercase text-gray-500 tracking-widest px-1">{t('email')}</label>
              <div className="relative">
                <input 
                  required
                  type="email" 
                  className="w-full bg-accent px-12 py-4 rounded-2xl outline-none border-2 border-transparent focus:border-primary font-bold transition-all"
                  placeholder="user@example.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
                <Mail className={`absolute ${language === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400`} size={20} />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-black uppercase text-gray-500 tracking-widest px-1">{t('password')}</label>
              <div className="relative">
                <input 
                  required
                  type={showPass ? 'text' : 'password'} 
                  className="w-full bg-accent px-12 py-4 rounded-2xl outline-none border-2 border-transparent focus:border-primary font-bold transition-all"
                  placeholder="••••••••"
                  value={formData.pass}
                  onChange={e => setFormData({ ...formData, pass: e.target.value })}
                />
                <Lock className={`absolute ${language === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400`} size={20} />
                <button 
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className={`absolute ${language === 'ar' ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors`}
                >
                  {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-gray-500 tracking-widest px-1">{t('confirmPassword')}</label>
                <div className="relative">
                  <input 
                    required
                    type="password" 
                    className="w-full bg-accent px-12 py-4 rounded-2xl outline-none border-2 border-transparent focus:border-primary font-bold transition-all"
                    placeholder="••••••••"
                    value={formData.confirmPass}
                    onChange={e => setFormData({ ...formData, confirmPass: e.target.value })}
                  />
                  <Lock className={`absolute ${language === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400`} size={20} />
                </div>
              </div>
            )}

            {isLogin && (
              <div className="text-right">
                <button 
                  type="button"
                  onClick={() => onNavigate('forgot-password')}
                  className="text-xs font-bold text-gray-400 hover:text-primary transition-colors"
                >
                  {t('forgotPassword')}
                </button>
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white font-black py-5 rounded-2xl text-lg hover:bg-secondary transition-all transform active:scale-95 shadow-xl shadow-primary/20 disabled:opacity-50"
            >
              {loading ? t('loading') : isLogin ? t('login') : t('signup')}
            </button>
          </form>

          <div className="mt-8 text-center text-sm font-bold">
            <span className="text-gray-400">
              {isLogin ? t('dontHaveAccount') : t('haveAccount')}
            </span>{' '}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary hover:underline"
            >
              {isLogin ? t('signup') : t('login')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
