import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { dashboardAPI } from '../utils/api';
import { CustomerDiscount } from '../utils/discount';

interface DiscountContextType {
  customerDiscount: CustomerDiscount | null;
  loading: boolean;
  refreshDiscount: () => Promise<void>;
}

const DiscountContext = createContext<DiscountContextType | undefined>(undefined);

export const DiscountProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [customerDiscount, setCustomerDiscount] = useState<CustomerDiscount | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchDiscount = async () => {
    if (!user || user.role !== 'customer') {
      setCustomerDiscount(null);
      return;
    }

    try {
      setLoading(true);
      const response = await dashboardAPI.getMyDiscount();
      console.log('DiscountContext - Discount response:', response);
      if (response.success && response.data && response.data.discount) {
        console.log('DiscountContext - Setting discount:', response.data.discount);
        setCustomerDiscount(response.data.discount);
      } else {
        console.log('DiscountContext - No discount found');
        setCustomerDiscount(null);
      }
    } catch (error) {
      console.error('Error fetching customer discount:', error);
      setCustomerDiscount(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscount();
  }, [user]);

  return (
    <DiscountContext.Provider value={{ 
      customerDiscount, 
      loading,
      refreshDiscount: fetchDiscount
    }}>
      {children}
    </DiscountContext.Provider>
  );
};

export const useDiscount = () => {
  const context = useContext(DiscountContext);
  if (context === undefined) {
    throw new Error('useDiscount must be used within a DiscountProvider');
  }
  return context;
};
