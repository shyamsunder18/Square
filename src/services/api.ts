
import axios from 'axios';

// Determine the API URL based on environment
// In production (like Vercel), we use relative URLs
// In development, we use the environment variable with a fallback to localhost
const isDevelopment = import.meta.env.DEV;
const API_URL = isDevelopment 
  ? (import.meta.env.VITE_API_URL || 'http://localhost:3300') 
  : '/api';

console.log('Using API URL:', API_URL); // This will help debug the connection issue

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

// Add response interceptor for error handling with more detailed logging
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Error Response:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error('API Error Request - No Response:', {
        request: error.request,
        url: error.config?.url,
        baseURL: API_URL
      });
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('API Error Setup:', error.message);
    }
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
