
// AuthContext.tsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  notifyLogin,
  notifyChange,
  notifyError,
} from "@/services/notificationService";

interface User {
  username: string;
}

interface AuthContextProps {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  verifyAdminPassword: (password: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextProps>({
  isAuthenticated: false,
  isLoading: false,
  user: null,
  login: async () => false,
  logout: () => {},
  verifyAdminPassword: async () => false,
});

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedLoginStatus = localStorage.getItem('isLoggedIn');
    const storedUsername = localStorage.getItem('username');
    
    if (storedLoginStatus === 'true' && storedUsername) {
      setIsAuthenticated(true);
      setUser({ username: storedUsername });
    }
    
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    // In a real app, this would validate against your backend API
    // For now, we'll just check against the hardcoded credentials
    if (username === "honeytrade" && password === "Honey@123") {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('username', username);
      setIsAuthenticated(true);
      setUser({ username });
      
      // Notify user login
      notifyLogin(username);
      
      navigate('/dashboard');
      return true;
    } else {
      notifyError("Login Failed", "Invalid username or password");
      return false;
    }
  };

  const verifyAdminPassword = async (password: string): Promise<boolean> => {
    // In a real app, this would validate against your backend API
    // For now, we'll check against the same password used for login
    if (isAuthenticated && password === "Honey@123") {
      // In a real app, you might set an admin session or token here
      localStorage.setItem('adminVerified', 'true');
      return true;
    } else {
      return false;
    }
  };

  const logout = () => {
    const username = user?.username;
    
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    localStorage.removeItem('adminVerified');
    setIsAuthenticated(false);
    setUser(null);
    
    // Notify user logout
    if (username) {
      notifyChange("User Logout", `User ${username} logged out.`);
    }

    navigate('/login');
  };

  const value: AuthContextProps = {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout,
    verifyAdminPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
