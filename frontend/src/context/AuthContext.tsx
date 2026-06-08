import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

export interface UserProfile {
  id: string;
  name?: string;
  fullName?: string;
  contactPerson?: string;
  mobile: string;
  address: string;
  orgType?: string;
  openingTime?: string;
  closingTime?: string;
  logoUrl?: string;
  profilePhoto?: string;
  city?: string;
  district?: string;
  state?: string;
  pincode?: string;
  currentLat?: number;
  currentLng?: number;
  gender?: string;
  dob?: string;
  govIdNumber?: string;
  idProofUrl?: string;
  vehicleType?: string;
  vehicleNumber?: string;
  availability?: string;
  status?: string;
}

export interface User {
  id: string;
  email: string;
  role: 'ADMIN' | 'ORGANIZATION_DONOR' | 'INDIVIDUAL_DONOR' | 'VOLUNTEER' | 'NGO';
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  profile?: UserProfile;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (credentials: any) => Promise<any>;
  registerUser: (formData: any) => Promise<any>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize Auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('foodbridge_token');
      const storedUser = localStorage.getItem('foodbridge_user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        
        try {
          // Verify/Fetch fresh user details from backend
          const response = await api.get('/auth/me');
          const freshUser = response.data.user;
          setUser(freshUser);
          localStorage.setItem('foodbridge_user', JSON.stringify(freshUser));
        } catch (error) {
          console.error('Failed to restore session:', error);
          // If token verification failed, wipe session
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials: any) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', credentials);
      const { token: receivedToken, user: receivedUser } = response.data;
      
      localStorage.setItem('foodbridge_token', receivedToken);
      localStorage.setItem('foodbridge_user', JSON.stringify(receivedUser));
      
      setToken(receivedToken);
      setUser(receivedUser);
      return receivedUser;
    } catch (error: any) {
      console.error('Login error in AuthContext:', error);
      throw error.response?.data || { message: 'Connection to server failed' };
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async (formData: any) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/register', formData);
      const { token: receivedToken, user: receivedUser } = response.data;

      localStorage.setItem('foodbridge_token', receivedToken);
      localStorage.setItem('foodbridge_user', JSON.stringify(receivedUser));

      setToken(receivedToken);
      setUser(receivedUser);
      return receivedUser;
    } catch (error: any) {
      console.error('Registration error in AuthContext:', error);
      throw error.response?.data || { message: 'Registration failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('foodbridge_token');
    localStorage.removeItem('foodbridge_user');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const response = await api.get('/auth/me');
      const freshUser = response.data.user;
      setUser(freshUser);
      localStorage.setItem('foodbridge_user', JSON.stringify(freshUser));
    } catch (error) {
      console.error('Failed to refresh user profile:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, registerUser, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
