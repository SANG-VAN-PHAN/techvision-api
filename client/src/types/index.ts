// Shared Types - Dùng chung cho cả Web và Mobile

export interface User {
  _id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  role: 'user' | 'admin';
  isActive: boolean;
  isEmailVerified: boolean;
  addresses: Address[];
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  _id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  district?: string;
  isDefault: boolean;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  shortDescription?: string;
  price: number;
  originalPrice?: number;
  category: Category;
  brand?: string;
  images: ProductImage[];
  thumbnail?: string;
  model3d?: Model3D;
  stock: number;
  features: string[];
  specifications: Specification[];
  isActive: boolean;
  isFeatured: boolean;
  isNew: boolean;
  rating: Rating;
  sold: number;
  viewCount: number;
}

export interface ProductImage {
  url: string;
  alt?: string;
  isPrimary?: boolean;
}

export interface Model3D {
  url: string;
  type: 'headphones' | 'phone' | 'watch' | 'speaker' | 'camera' | 'drone' | 'laptop' | 'custom';
  color?: string;
}

export interface Rating {
  average: number;
  count: number;
}

export interface Specification {
  label: string;
  value: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  icon: string;
  description?: string;
  productCount: number;
  isActive: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selected: boolean;
}

export interface Order {
  _id: string;
  orderNumber: string;
  user?: string;
  items: OrderItem[];
  shippingAddress: Address;
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  product: Product;
  name: string;
  image?: string;
  price: number;
  quantity: number;
  discount: number;
  total: number;
}

export type PaymentMethod = 'cod' | 'bank_transfer' | 'momo' | 'vnpay' | 'zalopay';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Coupon {
  _id: string;
  code: string;
  name: string;
  description?: string;
  type: 'percentage' | 'fixed' | 'free_shipping';
  value: number;
  maxDiscount?: number;
  minOrderAmount: number;
  usageLimit?: number;
  usageCount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isPublic: boolean;
  newUsersOnly: boolean;
}

export interface Review {
  _id: string;
  user: Pick<User, '_id' | 'name' | 'avatar'>;
  product: string;
  rating: number;
  title?: string;
  comment?: string;
  images?: string[];
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  helpful: number;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface ApiResponse<T> {
  status: 'success' | 'fail' | 'error';
  message?: string;
  data?: T;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
