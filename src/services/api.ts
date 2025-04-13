
import axios from 'axios';

// Use environment variable for API URL with fallback to localhost for development
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
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
    api.post('/auth/register', userData),
  login: (credentials: { email: string; password: string }) => 
    api.post('/auth/login', credentials),
  getCurrentUser: () => api.get('/auth/me'),
};

// Product APIs
export const productAPI = {
  getAllProducts: () => api.get('/products'),
  getProductsByCategory: (category: 'goods' | 'services') => 
    api.get(`/products?category=${category}`),
  getProductById: (id: string) => api.get(`/products/${id}`),
  addProduct: (productData: any) => api.post('/products', productData),
  updateProduct: (id: string, updates: any) => api.put(`/products/${id}`, updates),
  deleteProduct: (id: string) => api.delete(`/products/${id}`),
  getSellerProducts: (sellerId: string) => api.get(`/products/seller/${sellerId}`),
  getRecommendedProducts: () => api.get('/products/recommended'),
};

// Cart APIs
export const cartAPI = {
  getCart: () => api.get('/cart'),
  addToCart: (item: { productId: string; quantity?: number }) => 
    api.post('/cart/add', item),
  updateCartItem: (itemId: string, quantity: number) => 
    api.put(`/cart/update/${itemId}`, { quantity }),
  removeCartItem: (itemId: string) => api.delete(`/cart/remove/${itemId}`),
  clearCart: () => api.delete('/cart/clear'),
};

// Order APIs
export const orderAPI = {
  getOrders: () => api.get('/orders'),
  getOrderById: (id: string) => api.get(`/orders/${id}`),
  createOrder: (orderData: any) => api.post('/orders', orderData),
  getSales: () => api.get('/orders/sales/seller'),
  updateOrderStatus: (id: string, status: string) => 
    api.put(`/orders/${id}/status`, { status }),
};

// Review APIs
export const reviewAPI = {
  addReview: (productId: string, reviewData: any) => 
    api.post(`/reviews/${productId}`, reviewData),
  getProductReviews: (productId: string) => 
    api.get(`/reviews/product/${productId}`),
};

// Recharge APIs
export const rechargeAPI = {
  getUPIInfo: () => api.get('/recharge/upi-info'),
  submitRechargeRequest: (data: { amount: number; utrId: string }) => 
    api.post('/recharge/request', data),
  getPendingRequests: () => api.get('/recharge/pending'),
  approveRecharge: (userId: string, rechargeId: string) => 
    api.post(`/recharge/approve/${userId}/${rechargeId}`),
  rejectRecharge: (userId: string, rechargeId: string) => 
    api.post(`/recharge/reject/${userId}/${rechargeId}`),
  updateUPIInfo: (data: { image: string; upiId: string }) => 
    api.post('/recharge/update-upi-info', data),
  getRechargeHistory: () => api.get('/recharge/history'),
};

// New recommendation API
export const recommendationAPI = {
  getRecommendations: () => api.get('/recommendations'),
};

export default api;
