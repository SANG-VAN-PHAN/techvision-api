# 🚀 Deploy TechVision lên Render

## Cách 1: Manual Deploy (Nhanh nhất)

### 1.1 Tạo tài khoản Render
- Truy cập https://dashboard.render.com
- Đăng ký với GitHub

### 1.2 Tạo Web Service
1. Dashboard → **New +** → **Web Service**
2. Connect GitHub repo chứa code backend
3. Cấu hình:

| Setting | Value |
|---------|-------|
| **Region** | Singapore |
| **Branch** | main |
| **Root Directory** | server |
| **Runtime** | Node |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance Type** | Free |

### 1.3 Set Environment Variables
Trong Render dashboard → Environment:

```env
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://your-frontend-domain.onrender.com
```

### 1.4 Deploy
- Click **Create Web Service**
- Đợi build (~2-3 phút)
- Done! API sẽ có URL như: `https://techvision-api.onrender.com`

---

## Cách 2: Auto-Deploy qua Blueprint

### 1. Push code lên GitHub
```bash
cd server
git init
git add .
git commit -m "TechVision API"
git remote add origin https://github.com/YOUR_USERNAME/techvision.git
git push -u origin main
```

### 2. Deploy từ Blueprint
1. https://dashboard.render.com/blueprints
2. **New Blueprint Instance**
3. Connect GitHub repo
4. File `render.yaml` đã được cấu hình sẵn
5. Click **Apply Blueprint**

---

## ⚠️ Lưu ý quan trọng

### Free Tier Limits
- **750 giờ/tháng** (đủ cho ~1 site)
- **Sleeps** sau 15 phút không có traffic (cold start ~30s)
- **Không có persistent disk** - dùng MongoDB Atlas
- **512MB RAM**

### MongoDB Atlas
Nếu chưa có MongoDB Atlas:
1. https://www.mongodb.com/atlas → Tạo tài khoản free (M0)
2. Tạo cluster → Security → Database Access → Add User
3. Network Access → Add IP (0.0.0.0/0)
4. Clusters → Connect → Copy URI
5. Paste vào `MONGODB_URI` trong Render

### JWT_SECRET
Tạo secret ngẫu nhiên:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 🧪 Test API sau khi deploy

```bash
# Health check
curl https://your-app.onrender.com/api/health

# Login
curl -X POST https://your-app.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@techvision.vn","password":"admin123"}'
```

---

## 📁 Cấu trúc Deploy

```
your-repo/
├── server/
│   ├── src/
│   │   ├── index.js         # Entry point
│   │   ├── config/          # Database config
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # Express routes
│   │   └── controllers/    # Business logic
│   ├── public/             # Static files (frontend)
│   ├── package.json
│   ├── render.yaml         # Render config
│   └── .env               # ⚠️ KHÔNG push lên GitHub!
└── .gitignore
```

---

## 🔧 Troubleshooting

### Lỗi 503 Service Unavailable
- Kiểm tra logs trong Render dashboard
- Thường do `MONGODB_URI` sai

### Lỗi CORS
- Kiểm tra `FRONTEND_URL` đúng domain

### Cold Start chậm
- Upgrade lên plan Paid ($7/tháng) để tránh sleep

### Build fail
- Kiểm tra Node version (`engines` trong package.json)
- Đảm bảo tất cả dependencies trong `package.json`
