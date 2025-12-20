
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string) => Promise<boolean>;
  signup: (name: string, email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, pass: string) => {
    // Mock login logic - checks against saved users in localStorage
    const users = JSON.parse(localStorage.getItem('registered_users') || '[]');
    const existingUser = users.find((u: any) => u.email === email && u.pass === pass);

    if (existingUser) {
      const userToLogin = { id: existingUser.id, name: existingUser.name, email: existingUser.email };
      setUser(userToLogin);
      localStorage.setItem('user', JSON.stringify(userToLogin));
      return true;
    }
    
    // For testing: allow Ahmed if no users exist yet
    if (email === 'admin@king.com' && pass === '123456') {
      const adminUser = { id: 'admin', name: 'المدير', email };
      setUser(adminUser);
      localStorage.setItem('user', JSON.stringify(adminUser));
      return true;
    }

    return false;
  };

  const signup = async (name: string, email: string, pass: string) => {
    if (name && email && pass.length >= 6) {
      const users = JSON.parse(localStorage.getItem('registered_users') || '[]');
      
      if (users.find((u: any) => u.email === email)) {
        return false; // User already exists
      }

      const newUser = { id: Date.now().toString(), name, email, pass };
      users.push(newUser);
      localStorage.setItem('registered_users', JSON.stringify(users));

      const userToLogin = { id: newUser.id, name: newUser.name, email: newUser.email };
      setUser(userToLogin);
      localStorage.setItem('user', JSON.stringify(userToLogin));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
