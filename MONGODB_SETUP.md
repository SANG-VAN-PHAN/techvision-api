# 🚀 Hướng dẫn kết nối MongoDB

## Tình trạng hiện tại
- ❌ MongoDB chưa cài trên máy
- ✅ Code đã sẵn sàng với **3 lựa chọn tự động fallback**

## 🎯 Cách nhanh nhất: MongoDB Atlas (Cloud - Miễn phí)

### Bước 1: Tạo tài khoản Atlas
1. Truy cập: https://www.mongodb.com/cloud/atlas/register
2. Đăng ký miễn phí bằng Google/Email

### Bước 2: Tạo Cluster miễn phí
1. Chọn **M0 FREE** tier
2. Region: Singapore (gần Việt Nam)
3. Cluster Name: `techvision-cluster`
4. Click **Create Cluster**

### Bước 3: Tạo Database User
1. Vào **Database Access** → **Add New Database User**
2. Username: `techvision`
3. Password: `TechVision2026` (hoặc tự chọn)
4. Role: **Read and Write to any database**

### Bước 4: Whitelist IP
1. Vào **Network Access** → **Add IP Address**
2. Click **Allow Access from Anywhere** (0.0.0.0/0)
3. Confirm

### Bước 5: Lấy Connection String
1. Vào **Database** → **Connect** → **Connect your application**
2. Driver: Node.js, Version: 5.5+
3. Copy connection string, thay `<password>` bằng password của bạn

Ví dụ:
```
mongodb+srv://techvision:TechVision2026@cluster0.abc123.mongodb.net/techvision?retryWrites=true&w=majority
```

### Bước 6: Cập nhật .env
Mở file `server/.env`, thay dòng MONGODB_URI:
```env
MONGODB_URI=mongodb+srv://techvision:TechVision2026@cluster0.abc123.mongodb.net/techvision?retryWrites=true&w=majority
```

### Bước 7: Chạy server
```bash
cd server
npm run dev
```

---

## 💻 Cách 2: Cài MongoDB Local (Windows)

### Tải về:
https://www.mongodb.com/try/download/community

### Cài đặt:
1. Chạy file `.msi` vừa tải
2. Chọn **Complete**
3. Tick **Install MongoDB as a Service**
4. Service Name: `MongoDB`
5. Install

### Khởi động:
```powershell
# Cách 1: Qua Services
services.msc → Tìm MongoDB → Start

# Cách 2: Manual
mongod --dbpath C:\data\db
```

### Cập nhật .env:
```env
MONGODB_URI=mongodb://localhost:27017/techvision
```

---

## ⚡ Cách 3: Tự động (In-Memory - No Setup)

Nếu cả Atlas và Local đều không có, server tự động dùng **MongoDB in-memory**:
- ✅ Không cần cài gì
- ✅ Dữ liệu tự tạo khi server start
- ⚠️ Dữ liệu sẽ mất khi restart server

Code đã tự động fallback, chỉ cần:
```bash
cd server
npm install
npm run dev
```

---

## 🔍 Kiểm tra kết nối

Sau khi cấu hình, chạy:
```bash
cd server
npm run dev
```

Output mong đợi:
```
🔄 Thử kết nối Atlas MongoDB...
✅ Kết nối Atlas MongoDB thành công!
   Host: cluster0-shard-00-02.xxxxx.mongodb.net
   Database: techvision
✅ Admin account created
✅ Database setup complete!
```

Truy cập: http://localhost:5000/api/health

---

## 📊 Công cụ quản lý Database

### MongoDB Compass (GUI miễn phí)
Tải: https://www.mongodb.com/products/compass

Kết nối Atlas:
1. Mở Compass
2. New Connection
3. Paste connection string từ Atlas
4. Connect

### VS Code Extension
- **MongoDB for VS Code** - quản lý trực tiếp trong VS Code
