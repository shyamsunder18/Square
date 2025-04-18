
import axios from 'axios';

// Use environment variable for API URL with fallback to relative URL
// This ensures it works both in development and production environments
const API_URL = import.meta.env.VITE_API_URL || '';

// Create axios instance with base URL that will work in all environments
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (userData: { name: string; email: string; password: string }) => 
    api.post('/api/auth/register', userData),
  login: (credentials: { email: string; password: string }) => 
    api.post('/api/auth/login', credentials),
  getCurrentUser: () => api.get('/api/auth/me'),
};

// Product APIs
export const productAPI = {
  getAllProducts: () => api.get('/api/products'),
  getProductsByCategory: (category: 'goods' | 'services') => 
    api.get(`/api/products?category=${category}`),
  getProductById: (id: string) => api.get(`/api/products/${id}`),
  addProduct: (productData: any) => api.post('/api/products', productData),
  updateProduct: (id: string, updates: any) => api.put(`/api/products/${id}`, updates),
  deleteProduct: (id: string) => api.delete(`/api/products/${id}`),
  getSellerProducts: (sellerId: string) => api.get(`/api/products/seller/${sellerId}`),
  getRecommendedProducts: () => api.get('/api/products/recommended'),
};

// Cart APIs
export const cartAPI = {
  getCart: () => api.get('/api/cart'),
  addToCart: (item: { productId: string; quantity?: number }) => 
    api.post('/api/cart/add', item),
  updateCartItem: (itemId: string, quantity: number) => 
    api.put(`/api/cart/update/${itemId}`, { quantity }),
  removeCartItem: (itemId: string) => api.delete(`/api/cart/remove/${itemId}`),
  clearCart: () => api.delete('/api/cart/clear'),
};

// Order APIs
export const orderAPI = {
  getOrders: () => api.get('/api/orders'),
  getOrderById: (id: string) => api.get(`/api/orders/${id}`),
  createOrder: (orderData: any) => api.post('/api/orders', orderData),
  getSales: () => api.get('/api/orders/sales/seller'),
  updateOrderStatus: (id: string, status: string) => 
    api.put(`/api/orders/${id}/status`, { status }),
};

// Review APIs
export const reviewAPI = {
  addReview: (productId: string, reviewData: any) => 
    api.post(`/api/reviews/${productId}`, reviewData),
  getProductReviews: (productId: string) => 
    api.get(`/api/reviews/product/${productId}`),
};

// Recharge APIs
export const rechargeAPI = {
  getUPIInfo: () => api.get('/api/recharge/upi-info'),
  submitRechargeRequest: (data: { amount: number; utrId: string }) => 
    api.post('/api/recharge/request', data),
  getPendingRequests: () => api.get('/api/recharge/pending'),
  approveRecharge: (userId: string, rechargeId: string) => 
    api.post(`/api/recharge/approve/${userId}/${rechargeId}`),
  rejectRecharge: (userId: string, rechargeId: string) => 
    api.post(`/api/recharge/reject/${userId}/${rechargeId}`),
  updateUPIInfo: (data: { image: string; upiId: string }) => 
    api.post('/api/recharge/update-upi-info', data),
  getRechargeHistory: () => api.get('/api/recharge/history'),
};

// New recommendation API
export const recommendationAPI = {
  getRecommendations: () => api.get('/api/recommendations'),
};

export default api;
