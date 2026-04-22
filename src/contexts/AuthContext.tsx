import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, AuthPermissions, ROLE_PERMISSIONS, User } from '../types/auth';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  role: UserRole | null;
  permissions: AuthPermissions | null;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthState>({
  isAuthenticated: false,
  user: null,
  role: null,
  permissions: null,
  login: () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check local storage for session persistence
    const savedUserStr = localStorage.getItem('xrstarter_user');
    if (savedUserStr) {
      try {
        const savedUser = JSON.parse(savedUserStr);
        if (savedUser && savedUser.role) {
          setUser(savedUser);
        }
      } catch(e) {}
    }
  }, []);

  const login = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('xrstarter_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('xrstarter_user');
  };

  const role = user?.role as UserRole || null;
  const permissions = role ? ROLE_PERMISSIONS[role] : null;

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!user, user, role, permissions, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
