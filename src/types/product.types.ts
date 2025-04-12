
export type ProductReview = {
  id: string;
  productId: string;
  orderId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
};

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
  reviews?: ProductReview[];
  averageRating?: number;
};

export type ProductContextType = {
  products: Product[];
  userProducts: Product[];
  addProduct: (product: Omit<Product, "id" | "sellerId" | "createdAt" | "reviews" | "averageRating">) => void;
  updateProduct: (id: string, updates: Partial<Omit<Product, "id" | "sellerId" | "createdAt" | "reviews" | "averageRating">>) => void;
  deleteProduct: (id: string) => void;
  getProductById: (id: string) => Product | undefined;
  getProductsByCategory: (category: "goods" | "services") => Product[];
  addReview: (productId: string, rating: number, comment: string, orderId?: string) => void;
  getSellerRating: (sellerId: string) => { average: number; count: number };
};
