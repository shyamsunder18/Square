
import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "./AuthContext";

export type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  category: "goods" | "services";
  count?: number;
  sellerId: string;
  createdAt: string;
};

type ProductContextType = {
  products: Product[];
  userProducts: Product[];
  addProduct: (product: Omit<Product, "id" | "sellerId" | "createdAt">) => void;
  updateProduct: (id: string, updates: Partial<Omit<Product, "id" | "sellerId" | "createdAt">>) => void;
  deleteProduct: (id: string) => void;
  getProductById: (id: string) => Product | undefined;
  getProductsByCategory: (category: "goods" | "services") => Product[];
};

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Load products from localStorage
    const storedProducts = localStorage.getItem("products");
    if (storedProducts) {
      setProducts(JSON.parse(storedProducts));
    }
    
    // Initialize with demo products if none exist
    else {
      const demoProducts: Product[] = [
        {
          id: "1",
          title: "Wireless Headphones",
          description: "High-quality wireless headphones with noise cancellation.",
          price: 149.99,
          image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
          category: "goods",
          count: 10,
          sellerId: "demo1",
          createdAt: new Date().toISOString()
        },
        {
          id: "2",
          title: "Smart Watch",
          description: "Smart watch with health tracking features.",
          price: 199.99,
          image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
          category: "goods",
          count: 5,
          sellerId: "demo1",
          createdAt: new Date().toISOString()
        },
        {
          id: "3",
          title: "Web Development",
          description: "Professional web development services for your business.",
          price: 599.99,
          image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
          category: "services",
          sellerId: "demo2",
          createdAt: new Date().toISOString()
        },
        {
          id: "4",
          title: "Hair Styling",
          description: "Professional hair styling at your location.",
          price: 49.99,
          image: "https://images.unsplash.com/photo-1560066984-138dadb4c035",
          category: "services",
          sellerId: "demo2",
          createdAt: new Date().toISOString()
        }
      ];
      
      setProducts(demoProducts);
      localStorage.setItem("products", JSON.stringify(demoProducts));
    }
  }, []);

  useEffect(() => {
    // Update localStorage when products change
    localStorage.setItem("products", JSON.stringify(products));
  }, [products]);
  
  const userProducts = user 
    ? products.filter((product) => product.sellerId === user.id)
    : [];

  const addProduct = (product: Omit<Product, "id" | "sellerId" | "createdAt">) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to add products.",
        variant: "destructive"
      });
      return;
    }
    
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
      sellerId: user.id,
      createdAt: new Date().toISOString(),
    };
    
    setProducts((prev) => [...prev, newProduct]);
    
    toast({
      title: "Product added",
      description: "Your product has been successfully added.",
    });
  };

  const updateProduct = (
    id: string,
    updates: Partial<Omit<Product, "id" | "sellerId" | "createdAt">>
  ) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === id
          ? { ...product, ...updates }
          : product
      )
    );
    
    toast({
      title: "Product updated",
      description: "Your product has been successfully updated.",
    });
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((product) => product.id !== id));
    
    toast({
      title: "Product deleted",
      description: "Your product has been successfully deleted.",
    });
  };

  const getProductById = (id: string) => {
    return products.find((product) => product.id === id);
  };

  const getProductsByCategory = (category: "goods" | "services") => {
    return products.filter((product) => product.category === category);
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        userProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        getProductById,
        getProductsByCategory,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error("useProducts must be used within a ProductProvider");
  }
  return context;
};
