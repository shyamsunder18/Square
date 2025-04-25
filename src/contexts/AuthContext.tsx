
import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

type User = {
  id: string;
  name: string;
  email: string;
  isAdmin?: boolean;
  balance?: number;
  rechargeHistory?: any[];
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

// Admin credentials
const ADMIN_EMAIL = "admin@example.com";
const ADMIN_PASSWORD = "admin123";

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check for existing user in localStorage on mount
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setBalance(parsedUser.balance || 0);
    }
    
    // Check if we need to initialize admin user
    initializeAdminUser();
    
    setLoading(false);
  }, []);

  const initializeAdminUser = () => {
    // Get existing users or initialize empty array
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Check if admin exists
    const adminExists = users.some((u: any) => u.email === ADMIN_EMAIL);
    
    if (!adminExists) {
      // Create admin user
      const adminUser = {
        id: `admin-${Date.now()}`,
        name: "Admin",
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD, // In a real app, this should be hashed
        isAdmin: true,
        balance: 0
      };
      
      users.push(adminUser);
      localStorage.setItem('users', JSON.stringify(users));
    }
  };

  const refreshUserData = async () => {
    if (!user) return;
    
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const currentUser = users.find((u: any) => u.id === user.id);
      
      if (currentUser) {
        const updatedUser = {
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          isAdmin: currentUser.isAdmin || false,
          balance: currentUser.balance || 0,
          rechargeHistory: currentUser.rechargeHistory || []
        };
        
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setBalance(updatedUser.balance);
        return updatedUser;
      }
    } catch (error) {
      console.error("Failed to refresh user data:", error);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      // Check if user exists in localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const foundUser = users.find((u: any) => u.email === email && u.password === password);
      
      if (!foundUser) {
        throw new Error('Invalid credentials');
      }
      
      const userData = {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        isAdmin: foundUser.isAdmin || false,
        balance: foundUser.balance || 0,
        rechargeHistory: foundUser.rechargeHistory || []
      };
      
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setBalance(userData.balance);
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${userData.name}!`,
      });
      
      return userData;
    } catch (error: any) {
      console.error("Login error:", error);
      
      toast({
        title: "Login failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      // Get existing users or initialize empty array
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      
      // Check if user already exists
      if (users.some((u: any) => u.email === email)) {
        throw new Error('User already exists with this email');
      }
      
      // Create new user
      const newUser = {
        id: `user-${Date.now()}`,
        name,
        email,
        password, // In a real app, this should be hashed
        isAdmin: false,
        balance: 0,
        rechargeHistory: []
      };
      
      // Add to users array
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      
      // Set current user
      const userData = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        isAdmin: newUser.isAdmin,
        balance: newUser.balance,
        rechargeHistory: newUser.rechargeHistory
      };
      
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setBalance(userData.balance);
      
      toast({
        title: "Registration successful",
        description: "Your account has been created successfully.",
      });
      
      return userData;
    } catch (error: any) {
      console.error("Registration error:", error);
      
      toast({
        title: "Registration failed",
        description: error.message || "Registration failed",
        variant: "destructive",
      });
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setBalance(0);
    
    toast({
      title: "Logged out",
      description: "You've been logged out successfully.",
    });
    
    // Force reload to clear any user-specific state
    window.location.href = "/login";
  };

  const updateBalance = (newBalance: number) => {
    if (user) {
      const updatedUser = { ...user, balance: newBalance };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setBalance(newBalance);
      
      // Also update in users array
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const updatedUsers = users.map((u: any) => 
        u.id === user.id ? { ...u, balance: newBalance } : u
      );
      localStorage.setItem('users', JSON.stringify(updatedUsers));
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
