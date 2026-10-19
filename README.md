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

## 🎯 Live URLs

| Service | URL |
|---------|-----|
| **API Backend** | https://techvision-api.onrender.com |
| **Web PWA** | https://techvision-api.onrender.com |
| **Admin Panel** | https://techvision-api.onrender.com/admin |
| **GitHub Repo** | https://github.com/SANG-VAN-PHAN/techvision-api |

---

## 📂 Cấu trúc dự án chi tiết

```
3d-product-showcase/
├── .github/
│   └── workflows/
│       └── keep-alive.yml    # Auto-ping để chống sleep
│
├── client/                   # React Native (Expo) Mobile App
│   ├── App.tsx              # Entry point
│   ├── app.config.js        # Expo config
│   ├── src/
│   │   ├── config/
│   │   │   └── api.ts       # API endpoints config
│   │   ├── screens/         # 10 screens (Home, Products, Cart, etc.)
│   │   ├── navigation/
│   │   │   └── AppNavigator.tsx
│   │   ├── store/
│   │   │   └── useStore.ts  # Zustand state management
│   │   ├── types/
│   │   │   └── index.ts     # TypeScript interfaces
│   │   └── data/
│   │       └── products.ts  # Sample product data
│   └── package.json
│
├── server/                   # Node.js + Express Backend
│   ├── src/
│   │   ├── index.js         # Main entry point
│   │   ├── config/
│   │   │   └── database.js   # MongoDB connection
│   │   ├── controllers/     # Business logic
│   │   │   ├── authController.js
│   │   │   ├── productController.js
│   │   │   ├── orderController.js
│   │   │   └── dashboardController.js
│   │   ├── middleware/
│   │   │   ├── auth.js      # JWT verification
│   │   │   └── errorHandler.js
│   │   ├── models/          # MongoDB schemas
│   │   │   ├── User.js, Product.js, Order.js
│   │   │   ├── Category.js, Coupon.js, Review.js
│   │   │   ├── ProductItem.js, Branch.js
│   │   │   ├── Consignment.js, BuybackRequest.js
│   │   │   └── RentalOrder.js, Post.js
│   │   ├── routes/          # API routes
│   │   │   ├── auth.js, products.js, categories.js
│   │   │   ├── orders.js, users.js, coupons.js
│   │   │   ├── payments.js, admin.js, branches.js
│   │   │   └── productItems.js, rentals.js, etc.
│   │   └── services/
│   │       └── adminService.js
│   ├── public/              # Static frontend (PWA/Web)
│   │   ├── index.html       # Main web app
│   │   ├── admin/
│   │   │   ├── index.html   # Admin dashboard
│   │   │   └── login.html   # Admin login
│   │   ├── js/
│   │   │   └── sw.js        # Service Worker
│   │   └── manifest.json    # PWA manifest
│   ├── .env                 # Environment variables (local)
│   ├── package.json
│   ├── render.yaml          # Render deployment config
│   ├── seed.js              # Database seeder
│   ├── test-db.js           # DB connection test
│   └── API_DOCS.md          # API documentation
│
├── KEEP_ALIVE_GUIDE.md      # Hướng dẫn chống sleep
├── MONGODB_SETUP.md         # Hướng dẫn setup MongoDB Atlas
├── README.md
└── .gitignore
```

---

## 🛠️ Cài đặt Local

### Yêu cầu
- Node.js 18+
- MongoDB Atlas (cloud) hoặc MongoDB local
- npm hoặc yarn

### 1. Clone & Install

```bash
git clone https://github.com/SANG-VAN-PHAN/techvision-api.git
cd techvision-api
```

### 2. Backend

```bash
cd server
npm install
```

### 3. Tạo file `.env`

```bash
# Copy từ file mẫu (nếu có) hoặc tạo mới
cp .env.example .env
```

Nội dung `.env`:
```env
# Server
NODE_ENV=development
PORT=5000

# MongoDB (thay bằng URI của bạn)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/techvision

# JWT
JWT_SECRET=your-super-secret-key-at-least-32-chars
JWT_EXPIRES_IN=7d

# URLs
FRONTEND_URL=http://localhost:5000

# Admin account (tạo mặc định)
ADMIN_EMAIL=admin@techvision.vn
ADMIN_PASSWORD=Admin@2026
```

### 4. Chạy Backend

```bash
npm run dev
# Server chạy tại http://localhost:5000
```

### 5. Seed Database (tùy chọn)

```bash
# Tạo admin account và sample data
node seed.js
```

### 6. Frontend Mobile (React Native)

```bash
cd ../client
npm install
npx expo start
# Quét QR code bằng Expo Go
```

---

## 🚀 Deploy lên Render (Production)

### 1. Tạo tài khoản
- https://dashboard.render.com
- Connect GitHub repo: `SANG-VAN-PHAN/techvision-api`

### 2. Tạo Web Service
- **Root Directory:** `server`
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Instance:** Free

### 3. Set Environment Variables

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `MONGODB_URI` | `mongodb+srv://...` |
| `JWT_SECRET` | `openssl rand -hex 32` |
| `JWT_EXPIRES_IN` | `7d` |
| `FRONTEND_URL` | `https://your-app.onrender.com` |

### 4. Auto-Deploy
- Render sẽ tự động deploy mỗi khi push lên GitHub
- **Keep-alive:** GitHub Actions ping mỗi 14 phút để tránh sleep

---

## 🌐 MongoDB Atlas Setup

### 1. Tạo Cluster
1. https://www.mongodb.com/atlas
2. Đăng ký + Login
3. Tạo **Free Cluster** (M0 Sandbox)
4. Region: Singapore (gần Việt Nam)

### 2. Tạo Database User
1. **Security** → **Database Access**
2. Add New User
3. Quyền: **Read and write to any database**
4. Lưu lại username + password

### 3. Whitelist IP
1. **Security** → **Network Access**
2. Add IP Address
3. Chọn **Allow Access from Anywhere** (0.0.0.0/0) cho development

### 4. Lấy Connection String
1. **Deployment** → **Database**
2. Click **Connect** → **Connect your application**
3. Copy URI:
```
mongodb+srv://<username>:<password>@cluster.mongodb.net/techvision
```
4. Thay `<username>`, `<password>` bằng credentials đã tạo

---

## 📱 API Documentation

### Base URL
```
Production: https://techvision-api.onrender.com/api
Local:      http://localhost:5000/api
```

### Health Check
```bash
GET /api/health
# Response: { "status": "ok", "uptime": 123.45 }
```

### Authentication
```bash
# Register
POST /auth/register
Body: { "email": "...", "password": "...", "name": "..." }

# Login
POST /auth/login
Body: { "email": "...", "password": "..." }

# Get current user
GET /auth/me
Headers: { "Authorization": "Bearer <token>" }
```

### Products
```bash
GET /products                    # List products
GET /products/:slug             # Product detail
GET /products/featured           # Featured products
GET /products/best-sellers      # Best sellers
GET /products/search?q=keyword  # Search
```

### Orders
```bash
GET  /orders                    # My orders
POST /orders                    # Create order
PATCH /orders/:id/cancel        # Cancel order
```

### Full API Docs
Xem: `server/API_DOCS.md`

---

## 👑 Admin Panel

**URL:** https://techvision-api.onrender.com/admin

**Default credentials:**
- Email: `admin@techvision.vn`
- Password: `Admin@2026`

**Chức năng:**
- Dashboard thống kê
- Quản lý sản phẩm (CRUD)
- Quản lý đơn hàng
- Quản lý khách hàng
- Quản lý coupon
- Quản lý danh mục

---

## 🔄 Development Workflow

### Tạo model mới
```bash
# server/src/models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  // ...
});

module.exports = mongoose.model('Product', productSchema);
```

### Tạo route mới
```bash
# server/src/routes/products.js
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

router.get('/', async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

module.exports = router;
```

### Đăng ký route trong index.js
```bash
# server/src/index.js
const productRoutes = require('./routes/products');
app.use('/api/products', productRoutes);
```

---

## 🐛 Troubleshooting

### Lỗi "Cannot connect to MongoDB"
1. Kiểm tra `MONGODB_URI` trong `.env`
2. Kiểm tra IP whitelist trong MongoDB Atlas
3. Kiểm tra username/password

### Lỗi "JWT_SECRET is required"
1. Thêm `JWT_SECRET` vào `.env`
2. Restart server

### Lỗi "CORS"
1. Kiểm tra `FRONTEND_URL` trong env
2. Frontend và backend phải cùng domain hoặc configured CORS

### Render 404 on /admin
1. Kiểm tra file `server/public/admin/index.html` tồn tại
2. Kiểm tra static path trong `index.js`

---

## 📄 License

MIT License - 2026 TechVision
