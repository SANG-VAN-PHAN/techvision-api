// TechVision API Configuration
// Kết nối cùng Backend với Web

const API_URL = 'https://techvision-api.onrender.com/api';
const WS_URL = 'wss://techvision-api.onrender.com';

export const CONFIG = {
  API_URL,
  WS_URL,
  
  // Endpoints
  AUTH: {
    LOGIN: `${API_URL}/auth/login`,
    REGISTER: `${API_URL}/auth/register`,
    GOOGLE: `${API_URL}/auth/google`,
    FACEBOOK: `${API_URL}/auth/facebook`,
    REFRESH: `${API_URL}/auth/refresh`,
    LOGOUT: `${API_URL}/auth/logout`,
    ME: `${API_URL}/auth/me`,
    FORGOT_PASSWORD: `${API_URL}/auth/forgot-password`,
    RESET_PASSWORD: `${API_URL}/auth/reset-password`,
  },
  
  PRODUCTS: {
    LIST: `${API_URL}/products`,
    FEATURED: `${API_URL}/products/featured`,
    BEST_SELLERS: `${API_URL}/products/best-sellers`,
    SEARCH: `${API_URL}/products/search`,
    DETAIL: (slug) => `${API_URL}/products/${slug}`,
  },
  
  CATEGORIES: {
    LIST: `${API_URL}/categories`,
    DETAIL: (slug) => `${API_URL}/categories/${slug}`,
  },
  
  ORDERS: {
    LIST: `${API_URL}/orders`,
    CREATE: `${API_URL}/orders`,
    DETAIL: (id) => `${API_URL}/orders/${id}`,
    CANCEL: (id) => `${API_URL}/orders/${id}/cancel`,
  },
  
  COUPONS: {
    VALIDATE: `${API_URL}/coupons/validate`,
    AVAILABLE: `${API_URL}/coupons/available`,
  },
  
  PAYMENTS: {
    METHODS: `${API_URL}/payments/methods`,
    VNPAY: `${API_URL}/payments/vnpay/create`,
    MOMO: `${API_URL}/payments/momo/create`,
  },
  
  USERS: {
    PROFILE: `${API_URL}/users/profile`,
    CART: `${API_URL}/users/cart`,
    WISHLIST: `${API_URL}/users/wishlist`,
    ADDRESSES: `${API_URL}/users/addresses`,
  },
  
  ADMIN: {
    DASHBOARD: `${API_URL}/admin/dashboard`,
    PRODUCTS: `${API_URL}/products/admin/all`,
    ORDERS: `${API_URL}/orders/admin/all`,
    USERS: `${API_URL}/admin/users`,
    COUPONS: `${API_URL}/coupons/admin/all`,
  },
};

export default CONFIG;
