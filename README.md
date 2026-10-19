# 📱 TechVision - Full-Stack E-Commerce Platform

## 🚀 Tổng quan dự án

Hệ thống thương mại điện tử hoàn chỉnh với **Web**, **Mobile App (React Native)**, và **PWA** - cùng dữ liệu và backend.

```
techvision-ecommerce/
├── server/               # Backend Node.js + Express + MongoDB
│   ├── src/
│   │   ├── controllers/  # Logic xử lý API
│   │   ├── middleware/   # Auth, Error handling
│   │   ├── models/       # MongoDB Models
│   │   ├── routes/       # API Routes
│   │   └── index.js      # Entry point
│   ├── public/          # Frontend Web (SPA)
│   └── package.json
├── client/              # Mobile App (React Native + Expo)
│   ├── src/
│   │   ├── screens/     # App screens
│   │   ├── navigation/  # Navigation
│   │   ├── store/       # Zustand store
│   │   ├── types/       # TypeScript types
│   │   └── data/        # Shared data
│   └── package.json
└── README.md
```

---

## ✨ Tính năng

### 👤 Quản lý tài khoản
- Đăng ký / Đăng nhập (email + password)
- **OAuth Login**: Google, Facebook
- Đặt lại mật khẩu qua email
- Trang cá nhân với thông tin, địa chỉ
- Lịch sử đơn hàng

### 🛒 Mua sắm
- Danh mục sản phẩm đa dạng
- **3D Product Viewer** - xem sản phẩm dạng 3D khi click
- Tìm kiếm, lọc sản phẩm
- Giỏ hàng với đầy đủ chức năng
- Thanh toán đa phương thức (COD, Bank, MoMo, VNPay)

### 🎟️ Ưu đãi & Coupon
- Mã giảm giá theo % hoặc số tiền cố định
- Giảm phí ship
- Giới hạn sử dụng, ngày hết hạn
- Coupon cho thành viên mới

### 🔐 Bảo mật
- JWT Authentication với refresh token
- Rate Limiting chống brute force
- Helmet security headers
- Password bcrypt hashing
- Account lockout protection

### 👑 Admin Dashboard
- Quản lý sản phẩm (CRUD, upload ảnh, 3D models)
- Quản lý đơn hàng (xem, cập nhật trạng thái)
- Quản lý khách hàng (kích hoạt/vô hiệu)
- Quản lý coupon
- Dashboard thống kê

### 📱 Mobile App (React Native)
- Giao diện native iOS/Android
- Cùng dữ liệu với Web
- 3D viewer trong app
- Push notifications
- Offline support

### 🌐 PWA (Progressive Web App)
- Cài đặt như app thật
- Offline support
- Service Worker
- Push notifications

---

## 📦 Cài đặt

### Backend + Web

```bash
# 1. Di chuyển vào thư mục server
cd server

# 2. Cài đặt dependencies
npm install

# 3. Cấu hình MongoDB (.env)
# MONGODB_URI=mongodb://localhost:27017/techvision

# 4. Chạy server
npm run dev

# 5. Mở trình duyệt
# http://localhost:5000
```

### Mobile App

```bash
# 1. Di chuyển vào thư mục client
cd client

# 2. Cài đặt dependencies
npm install

# 3. Cài đặt Expo CLI (nếu chưa có)
npm install -g expo-cli

# 4. Chạy app
npm start

# 5. Quét QR code bằng Expo Go (iOS/Android)
```

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Mô tả |
|--------|----------|--------|
| POST | `/api/auth/register` | Đăng ký |
| POST | `/api/auth/login` | Đăng nhập |
| POST | `/api/auth/google` | Login Google |
| POST | `/api/auth/facebook` | Login Facebook |
| POST | `/api/auth/refresh` | Refresh token |
| GET | `/api/auth/me` | Thông tin user |

### Products
| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET | `/api/products` | Danh sách sản phẩm |
| GET | `/api/products/:slug` | Chi tiết sản phẩm |
| GET | `/api/products/featured` | Sản phẩm nổi bật |
| POST | `/api/products` | Tạo sản phẩm (Admin) |

### Orders
| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET | `/api/orders` | Đơn hàng của tôi |
| POST | `/api/orders` | Tạo đơn hàng |
| PATCH | `/api/orders/:id/cancel` | Hủy đơn |

### Coupons
| Method | Endpoint | Mô tả |
|--------|----------|--------|
| POST | `/api/coupons/validate` | Kiểm tra coupon |
| GET | `/api/coupons/available` | Coupon khả dụng |

---

## 🗄️ Database Models

- **User**: Thông tin cá nhân, OAuth IDs, refresh tokens
- **Product**: Sản phẩm, 3D models, tồn kho
- **Order**: Đơn hàng, items, shipping
- **Coupon**: Mã giảm giá, điều kiện sử dụng
- **Review**: Đánh giá sản phẩm

---

## 🔒 Bảo mật

- ✅ Password hashed với bcrypt (12 rounds)
- ✅ JWT tokens với expiration
- ✅ Rate limiting (100 req/15min)
- ✅ Helmet security headers
- ✅ Account lockout protection
- ✅ CORS configured

---

## 👑 Tài khoản Admin

**Mặc định:**
- Email: `admin@techvision.vn`
- Password: `Admin@2026`

---

## 📱 Build Mobile App

### iOS (cần Mac)
```bash
eas build -p ios --profile preview
```

### Android
```bash
eas build -p android --profile preview
```

### PWA/Web
```bash
expo export --platform web
```

---

## 📝 Development Notes

### Cấu hình OAuth (Production)
```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
```

### Cấu hình thanh toán (Production)
```env
VNPAY_MERCHANT_ID=your_vnpay_merchant
VNPAY_MERCHANT_KEY=your_vnpay_key
MOMO_PARTNER_CODE=your_momo_partner
MOMO_ACCESS_KEY=your_momo_access_key
```

---

## 📄 License

MIT License - 2026 TechVision
