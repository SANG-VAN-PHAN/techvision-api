import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Product, CartItem, Order } from '../types';
import { PRODUCTS, COUPONS } from '../data/products';

interface AppState {
  // User
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  
  // Cart
  cart: CartItem[];
  cartTotal: number;
  
  // Wishlist
  wishlist: Product[];
  
  // Orders
  orders: Order[];
  
  // Products
  products: Product[];
  categories: typeof COUPONS;
  
  // UI
  isLoading: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithFacebook: () => Promise<void>;
  logout: () => void;
  
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  
  calculateCartTotal: () => number;
}

export const useStore = create<AppState>((set, get) => ({
  // Initial state
  user: null,
  token: null,
  isAuthenticated: false,
  cart: [],
  cartTotal: 0,
  wishlist: [],
  orders: [],
  products: PRODUCTS,
  categories: [],
  isLoading: false,

  // Login
  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      // In production: call API
      const user: User = {
        _id: '1',
        email,
        name: email.split('@')[0],
        role: email.includes('admin') ? 'admin' : 'user',
        isActive: true,
        addresses: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      await AsyncStorage.setItem('user', JSON.stringify(user));
      await AsyncStorage.setItem('token', 'demo_token');
      
      set({ user, token: 'demo_token', isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  loginWithGoogle: async () => {
    // TODO: Implement Google Sign-In
    console.log('Google Login');
  },

  loginWithFacebook: async () => {
    // TODO: Implement Facebook Login
    console.log('Facebook Login');
  },

  logout: async () => {
    await AsyncStorage.multiRemove(['user', 'token', 'cart']);
    set({ user: null, token: null, isAuthenticated: false, cart: [], wishlist: [] });
  },

  // Cart
  addToCart: (product: Product, quantity = 1) => {
    const { cart } = get();
    const existingIndex = cart.findIndex(item => item.product._id === product._id);
    
    if (existingIndex >= 0) {
      const newCart = [...cart];
      newCart[existingIndex].quantity += quantity;
      set({ cart: newCart });
    } else {
      set({ cart: [...cart, { product, quantity, selected: true }] });
    }
    
    get().calculateCartTotal();
    AsyncStorage.setItem('cart', JSON.stringify(get().cart));
  },

  removeFromCart: (productId: string) => {
    const newCart = get().cart.filter(item => item.product._id !== productId);
    set({ cart: newCart });
    get().calculateCartTotal();
    AsyncStorage.setItem('cart', JSON.stringify(newCart));
  },

  updateCartQuantity: (productId: string, quantity: number) => {
    if (quantity <= 0) {
      get().removeFromCart(productId);
      return;
    }
    
    const newCart = get().cart.map(item =>
      item.product._id === productId ? { ...item, quantity } : item
    );
    set({ cart: newCart });
    get().calculateCartTotal();
    AsyncStorage.setItem('cart', JSON.stringify(newCart));
  },

  clearCart: () => {
    set({ cart: [], cartTotal: 0 });
    AsyncStorage.removeItem('cart');
  },

  // Wishlist
  addToWishlist: (product: Product) => {
    const { wishlist } = get();
    if (!wishlist.find(p => p._id === product._id)) {
      set({ wishlist: [...wishlist, product] });
    }
  },

  removeFromWishlist: (productId: string) => {
    set({ wishlist: get().wishlist.filter(p => p._id !== productId) });
  },

  // User
  setUser: (user: User | null) => set({ user }),
  setToken: (token: string | null) => set({ token }),

  // Calculate
  calculateCartTotal: () => {
    const total = get().cart.reduce(
      (sum, item) => sum + (item.product.price * item.quantity),
      0
    );
    set({ cartTotal: total });
    return total;
  },
}));

// Initialize from storage
export const initializeStore = async () => {
  try {
    const [userStr, tokenStr, cartStr] = await AsyncStorage.multiGet(['user', 'token', 'cart']);
    
    if (userStr[1] && tokenStr[1]) {
      useStore.setState({
        user: JSON.parse(userStr[1]),
        token: tokenStr[1],
        isAuthenticated: true,
      });
    }
    
    if (cartStr[1]) {
      const cart = JSON.parse(cartStr[1]);
      useStore.setState({ cart });
      useStore.getState().calculateCartTotal();
    }
  } catch (error) {
    console.log('Error initializing store:', error);
  }
};
