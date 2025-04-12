
import { Product, ProductReview } from "../types/product.types";

export const calculateAverageRating = (reviews: ProductReview[]): number => {
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  return sum / reviews.length;
};

export const getProductById = (products: Product[], id: string): Product | undefined => {
  return products.find((product) => product.id === id);
};

export const getProductsByCategory = (products: Product[], category: "goods" | "services"): Product[] => {
  return products.filter((product) => product.category === category);
};

export const getSellerRating = (products: Product[], sellerId: string): { average: number; count: number } => {
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
