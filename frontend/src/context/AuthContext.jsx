import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('insightflow_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (email, password) => {
    // Strict mock validation for a realistic simulation
    if (email === 'admin@insightflow.com' && password === 'admin123') {
      const userData = {
        name: 'Love Maggo',
        email: email,
        role: 'Software Engineer',
        loggedInAt: new Date().toISOString()
      };
      localStorage.setItem('insightflow_user', JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    }
    return { success: false, error: 'Invalid email or password. Hint: Use the auto-fill button below.' };
  };

  const logout = () => {
    localStorage.removeItem('insightflow_user');
    setUser(null);
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
