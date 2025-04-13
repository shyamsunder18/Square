
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
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    
    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setBalance(parsedUser.balance || 0);
        
        // Verify token validity with the server
        authAPI.getCurrentUser()
          .catch((error) => {
            console.error("Token validation error:", error);
            // If token is invalid, log out the user
            logout();
          });
      } catch (error) {
        console.error("Error parsing stored user data:", error);
        logout();
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login({ email, password });
      const userData = response.data;
      
      localStorage.setItem("token", userData.token);
      localStorage.setItem("user", JSON.stringify(userData.user));
      
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
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorMessage = error.response.data.message || "Invalid email or password";
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = "No response from server. Please try again later.";
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
      localStorage.setItem("user", JSON.stringify(userData.user));
      
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
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorMessage = error.response.data.message || "Registration failed";
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = "No response from server. Please try again later.";
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
    localStorage.removeItem("user");
    
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
      localStorage.setItem("user", JSON.stringify(updatedUser));
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
      }}
    >
      {children}
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
