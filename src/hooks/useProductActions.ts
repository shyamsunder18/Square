
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "./use-toast";
import { Product, ProductReview } from "../types/product.types";
import { calculateAverageRating } from "../utils/product.utils";

export const useProductActions = () => {
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
      const demoProducts: Product[] = [];
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

  const addProduct = (product: Omit<Product, "id" | "sellerId" | "createdAt" | "reviews" | "averageRating">) => {
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
      reviews: [],
      averageRating: 0
    };
    
    setProducts((prev) => [...prev, newProduct]);
    
    toast({
      title: "Product added",
      description: "Your product has been successfully added.",
    });
  };

  const updateProduct = (
    id: string,
    updates: Partial<Omit<Product, "id" | "sellerId" | "createdAt" | "reviews" | "averageRating">>
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

  const addReview = (productId: string, rating: number, comment: string, orderId?: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to add reviews.",
        variant: "destructive"
      });
      return;
    }

    const newReview: ProductReview = {
      id: Date.now().toString(),
      productId,
      orderId: orderId || Date.now().toString(), // Use the provided orderId or generate one
      userId: user.id,
      userName: user.name,
      rating,
      comment,
      createdAt: new Date().toISOString()
    };

    setProducts((prev) => 
      prev.map((product) => {
        if (product.id === productId) {
          const updatedReviews = [...(product.reviews || []), newReview];
          const averageRating = calculateAverageRating(updatedReviews);
          
          return {
            ...product,
            reviews: updatedReviews,
            averageRating
          };
        }
        return product;
      })
    );
    
    // Find the seller of this product to notify them
    const product = products.find(p => p.id === productId);
    
    if (product) {
      const { sellerId, title } = product;
      
      // This is a placeholder for notification system integration
      console.log(`Notification for seller ${sellerId} about review on ${title}`);
    }
    
    toast({
      title: "Review added",
      description: "Your review has been successfully submitted.",
    });
  };

  const getSellerRating = (sellerId: string) => {
    const sellerProducts = products.filter(product => product.sellerId === sellerId);
    
    let totalRatings = 0;
    let reviewCount = 0;
    
    sellerProducts.forEach(product => {
      if (product.reviews && product.reviews.length > 0) {
        product.reviews.forEach(() => {
          reviewCount++;
        });
        totalRatings += (product.averageRating || 0) * (product.reviews.length);
      }
    });
    
    return {
      average: reviewCount > 0 ? totalRatings / reviewCount : 0,
      count: reviewCount
    };
  };

  return {
    products,
    userProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductById,
    getProductsByCategory,
    addReview,
    getSellerRating
  };
};
