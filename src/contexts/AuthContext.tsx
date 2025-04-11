import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";

type User = {
  id: string;
  name: string;
  email: string;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // In a real app, this would be an API call
      // Simulating login for demo purposes
      if (email && password) {
        // Find user in localStorage
        const users = JSON.parse(localStorage.getItem("users") || "[]");
        const user = users.find((u: any) => u.email === email && u.password === password);
        
        if (user) {
          const { password, ...userWithoutPassword } = user;
          setUser(userWithoutPassword);
          localStorage.setItem("user", JSON.stringify(userWithoutPassword));
          toast({
            title: "Login successful",
            description: "You've been logged in successfully.",
          });
        } else {
          throw new Error("Invalid email or password");
        }
      }
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      // In a real app, this would be an API call
      // Simulating registration for demo purposes
      if (name && email && password) {
        // Check if user already exists
        const users = JSON.parse(localStorage.getItem("users") || "[]");
        const existingUser = users.find((u: any) => u.email === email);
        
        if (existingUser) {
          throw new Error("User with this email already exists");
        }
        
        // Create new user
        const newUser = {
          id: Date.now().toString(),
          name,
          email,
          password,
        };
        
        users.push(newUser);
        localStorage.setItem("users", JSON.stringify(users));
        
        // Log in the user
        const { password: _, ...userWithoutPassword } = newUser;
        setUser(userWithoutPassword);
        localStorage.setItem("user", JSON.stringify(userWithoutPassword));
        
        toast({
          title: "Registration successful",
          description: "Your account has been created successfully.",
        });
      }
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    toast({
      title: "Logged out",
      description: "You've been logged out successfully.",
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
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
