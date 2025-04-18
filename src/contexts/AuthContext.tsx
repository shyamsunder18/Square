
import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import api, { authAPI } from "@/services/api";

type User = {
  id: string;
  name: string;
  email: string;
  isAdmin?: boolean;
  balance?: number;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  balance: number;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateBalance: (newBalance: number) => void;
  refreshUserData: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const refreshUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      const { data } = await authAPI.getCurrentUser();
      if (data && data.user) {
        setUser(data.user);
        setBalance(data.user.balance || 0);
      }
    } catch (error) {
      console.error("Failed to refresh user data:", error);
      // Invalid or expired token
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUserData();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login({ email, password });
      const userData = response.data;
      
      localStorage.setItem("token", userData.token);
      
      setUser(userData.user);
      setBalance(userData.user.balance || 0);
      
      toast({
        title: "Login successful",
        description: "You've been logged in successfully.",
      });
    } catch (error: any) {
      console.error("Login error:", error);
      
      let errorMessage = "Unable to login. Please check your network connection.";
      if (error.response) {
        errorMessage = error.response.data.message || "Invalid email or password";
      } else if (error.request) {
        errorMessage = "Server is not responding. Please try again later.";
      } else {
        errorMessage = "Network error. Please check your connection.";
      }
      
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await authAPI.register({ name, email, password });
      const userData = response.data;
      
      localStorage.setItem("token", userData.token);
      
      setUser(userData.user);
      setBalance(userData.user.balance || 0);
      
      toast({
        title: "Registration successful",
        description: "Your account has been created successfully.",
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      
      let errorMessage = "Unable to register. Please check your network connection.";
      if (error.response) {
        errorMessage = error.response.data.message || "Registration failed";
      } else if (error.request) {
        errorMessage = "Server is not responding. Please ensure your backend server is running.";
      } else {
        errorMessage = "Network error. Please check your connection.";
      }
      
      toast({
        title: "Registration failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setBalance(0);
    localStorage.removeItem("token");
    
    toast({
      title: "Logged out",
      description: "You've been logged out successfully.",
    });
  };

  const updateBalance = (newBalance: number) => {
    if (user) {
      const updatedUser = { ...user, balance: newBalance };
      setUser(updatedUser);
      setBalance(newBalance);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.isAdmin || false,
        balance,
        login,
        register,
        logout,
        updateBalance,
        refreshUserData,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
