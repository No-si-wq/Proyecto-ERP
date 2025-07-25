import React, { createContext, useState, useContext } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(false);
  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}