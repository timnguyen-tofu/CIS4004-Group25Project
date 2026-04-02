// ── Auth Context ──────────────────────────────────────────────
// Stores the logged-in user and token globally so any component
// can access them without passing props through every level.

import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Try to restore the session from localStorage on first load
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('km_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('km_token') || null;
  });

  // Call this after a successful login or register
  function login(userData, authToken) {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('km_user',  JSON.stringify(userData));
    localStorage.setItem('km_token', authToken);
  }

  // Call this when the user clicks Log Out
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

// Custom hook — any component can call useAuth() to get user/token/login/logout
export function useAuth() {
  return useContext(AuthContext);
}
