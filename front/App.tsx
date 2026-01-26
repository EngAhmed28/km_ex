
import React, { useState, useEffect } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { DiscountProvider } from './context/DiscountContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Categories from './pages/Categories';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Login from './pages/Login';
import BestSellers from './pages/BestSellers';
import NewArrivals from './pages/NewArrivals';
import Checkout from './pages/Checkout';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Orders from './pages/Orders';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [pageParams, setPageParams] = useState<any>({});

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage, pageParams]);

  const navigate = (page: string, params: any = {}) => {
    setCurrentPage(page);
    setPageParams(params);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <Home onNavigate={navigate} />;
      case 'categories': return <Categories onNavigate={navigate} />;
      case 'shop': return <Shop onNavigate={navigate} initialParams={pageParams} />;
      case 'product': return <ProductDetail id={pageParams.id} onNavigate={navigate} />;
      case 'cart': return <Cart onNavigate={navigate} />;
      case 'bestsellers': return <BestSellers onNavigate={navigate} />;
      case 'newarrivals': return <NewArrivals onNavigate={navigate} />;
      case 'login': return <Login onNavigate={navigate} type="login" initialEmail={pageParams.email} />;
      case 'signup': return <Login onNavigate={navigate} type="signup" initialEmail={pageParams.email} />;
      case 'dashboard': return <Dashboard onNavigate={navigate} />;
      case 'admin-dashboard': return <AdminDashboard onNavigate={navigate} initialTab={pageParams.tab} />;
      case 'orders': return <Orders onNavigate={navigate} />;
      case 'checkout': return <Checkout onNavigate={navigate} />;
      case 'forgot-password': return (
        <div className="container mx-auto px-4 py-32 text-center">
          <h2 className="text-3xl font-black italic uppercase mb-4">استعادة كلمة المرور</h2>
          <p className="text-lg font-bold text-gray-500 max-w-md mx-auto">أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور.</p>
          <div className="mt-8 max-w-sm mx-auto">
            <input type="email" placeholder="البريد الإلكتروني" className="w-full bg-accent p-4 rounded-xl outline-none mb-4" />
            <button onClick={() => navigate('login')} className="w-full bg-primary text-white py-4 rounded-xl font-black">إرسال الرابط</button>
          </div>
        </div>
      );
      default: return <Home onNavigate={navigate} />;
    }
  };

  return (
    <LanguageProvider>
      <AuthProvider>
        <DiscountProvider>
          <WishlistProvider>
            <CartProvider>
              <div className="min-h-screen flex flex-col selection:bg-primary selection:text-white">
                <Header onNavigate={navigate} />
                <main className="flex-grow">
                  {renderPage()}
                </main>
                <Footer />
              </div>
            </CartProvider>
          </WishlistProvider>
        </DiscountProvider>
      </AuthProvider>
    </LanguageProvider>
  );
};

export default App;
