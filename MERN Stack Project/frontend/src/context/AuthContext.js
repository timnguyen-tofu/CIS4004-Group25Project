import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // restore session from localStorage on page load
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('km_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem('km_token') || null);

  function login(userData, authToken) {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('km_user',  JSON.stringify(userData));
    localStorage.setItem('km_token', authToken);
  }

  function logout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem('km_user');
    localStorage.removeItem('km_token');
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
