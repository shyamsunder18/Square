
import React, { createContext, useContext, ReactNode } from "react";
import { useProductActions } from "@/hooks/useProductActions";
import { ProductContextType } from "@/types/product.types";

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { 
    products, 
    userProducts, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    getProductById, 
    getProductsByCategory,
    addReview,
    getSellerRating
  } = useProductActions();

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
        addReview,
        getSellerRating,
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

// Re-export the types
export type { Product, ProductReview } from "@/types/product.types";
