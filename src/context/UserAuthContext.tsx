import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { userAuthService, AppUser, RegisterData, LoginData, UpdateProfileData } from '../services/userAuthService';

interface UserAuthContextType {
  user: AppUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
  getUserOrders: () => Promise<any[]>;
}

const UserAuthContext = createContext<UserAuthContextType | undefined>(undefined);

export const UserAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const currentUser = userAuthService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const login = async (data: LoginData) => {
    setLoading(true);
    try {
      const authenticatedUser = await userAuthService.login(data);
      userAuthService.saveUserSession(authenticatedUser);
      setUser(authenticatedUser);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setLoading(true);
    try {
      const newUser = await userAuthService.register(data);
      userAuthService.saveUserSession(newUser);
      setUser(newUser);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    userAuthService.logout();
    setUser(null);
  };

  const updateProfile = async (data: UpdateProfileData) => {
    if (!user) throw new Error('No user logged in');
    
    setLoading(true);
    try {
      const updatedUser = await userAuthService.updateProfile(user.id, data);
      userAuthService.saveUserSession(updatedUser);
      setUser(updatedUser);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getUserOrders = async () => {
    if (!user) throw new Error('No user logged in');
    return await userAuthService.getUserOrders(user.id);
  };

  return (
    <UserAuthContext.Provider value={{
      user,
      loading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      updateProfile,
      getUserOrders,
    }}>
      {children}
    </UserAuthContext.Provider>
  );
};

export const useUserAuth = (): UserAuthContextType => {
  const context = useContext(UserAuthContext);
  if (context === undefined) {
    throw new Error('useUserAuth must be used within a UserAuthProvider');
  }
  return context;
};