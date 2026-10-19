# 📚 TechVision API Documentation

Base URL: `http://localhost:5000/api`

## 🔑 Authentication

Hầu hết endpoints yêu cầu Bearer Token trong header:
```
Authorization: Bearer <jwt_token>
```

Lấy token qua `POST /api/auth/login` rồi dùng cho các request sau.

---

## 🔐 Tài khoản test

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@techvision.vn | admin123 |
| Staff | staff@techvision.vn | staff123 |
| Customer | sangvanphan30012003@gmail.com | sang123 |

---

## 📋 Tổng quan endpoints

| Module | Base | Methods |
|--------|------|---------|
| Auth | `/api/auth` | POST login, register |
| Users | `/api/users` | CRUD |
| Products | `/api/products` | CRUD, search, filter |
| Categories | `/api/categories` | CRUD |
| Branches | `/api/branches` | CRUD |
| **ProductItems** (đặc thù 2hand) | `/api/product-items` | CRUD + filter by IMEI/Serial |
| Orders | `/api/orders` | CRUD + status update |
| **Rentals** (Thuê) | `/api/rentals` | Đặt thuê + lifecycle |
| **Buyback** (Thu mua) | `/api/buyback` | Yêu cầu + định giá |
| **Consignments** (Ký gửi) | `/api/consignments` | Lifecycle + commission |
| Posts (Blog) | `/api/posts` | CRUD + filter by category |
| Coupons | `/api/coupons` | CRUD + validate |
| Payments | `/api/payments` | Momo, VNPay... |

---

## 🔥 Chi tiết các API mới

### 1️⃣ Branches - Chi nhánh

```http
GET /api/branches                 # Lấy tất cả (public)
GET /api/branches?city=TP. HCM   # Lọc theo thành phố
GET /api/branches/:id            # Chi tiết
POST /api/branches               # Tạo (Admin)
PUT /api/branches/:id            # Sửa (Admin)
DELETE /api/branches/:id         # Xóa (Admin)
```

Body tạo branch:
```json
{
  "name": "Chi nhánh Quận 1",
  "phone": "02811112222",
  "email": "q1@techvision.vn",
  "address": "123 Nguyễn Huệ",
  "city": "TP. Hồ Chí Minh",
  "district": "Quận 1",
  "location": { "lat": 10.776, "lng": 106.700 },
  "workingHours": "8:00 - 22:00"
}
```

### 2️⃣ ProductItems - Quản lý từng máy cụ thể

```http
GET /api/product-items
GET /api/product-items?product=<product_id>     # Lọc theo dòng sản phẩm
GET /api/product-items?branch=<branch_id>       # Lọc theo chi nhánh
GET /api/product-items?status=available         # Lọc theo trạng thái
GET /api/product-items?forSale=true             # Chỉ máy đang bán
GET /api/product-items?forRent=true             # Chỉ máy cho thuê
GET /api/product-items?condition=like_new       # Lọc theo tình trạng
GET /api/product-items?minPrice=10000000&maxPrice=20000000
GET /api/product-items/:id                      # Chi tiết
GET /api/product-items/serial/35xxxx            # Tra cứu theo IMEI/Serial
POST /api/product-items                         # Tạo (Staff)
PUT /api/product-items/:id                      # Sửa (Staff)
PATCH /api/product-items/:id/status             # Đổi trạng thái (Staff)
DELETE /api/product-items/:id                   # Xóa (Admin)
```

Body tạo ProductItem:
```json
{
  "product": "674xxx",
  "branch": "674xxx",
  "serialNumber": "SN123456",
  "imei": "359999999999999",
  "conditionRate": 97,
  "conditionLabel": "like_new",
  "conditionDetail": "Xước nhẹ viền",
  "batteryHealth": 88,
  "cycleCount": 234,
  "includedAccessories": "Kèm sạc, cáp",
  "salePrice": 17500000,
  "originalPrice": 22990000,
  "costPrice": 14000000,
  "rentalPricePerDay": 90000,
  "rentalPricePerMonth": 2500000,
  "rentalDeposit": 5000000,
  "isForSale": true,
  "isForRent": true,
  "status": "available"
}
```

Trạng thái: `available`, `reserved`, `sold`, `rented`, `in_maintenance`, `in_transit`, `consigned`

### 3️⃣ Rentals - Đơn thuê

**Luồng:** `pending → confirmed → active → returned/completed`

```http
GET /api/rentals                  # Danh sách (user: của mình, staff: tất cả)
GET /api/rentals?status=active    # Lọc theo status
GET /api/rentals/:id              # Chi tiết
POST /api/rentals                 # Tạo đơn thuê
PATCH /api/rentals/:id/confirm    # Staff xác nhận (nhận cọc)
PATCH /api/rentals/:id/active     # Staff bàn giao máy
PATCH /api/rentals/:id/return     # Staff trả máy + kiểm tra
PATCH /api/rentals/:id/cancel     # Hủy đơn
```

Tạo đơn thuê:
```json
{
  "productItem": "674xxx",
  "startDate": "2026-10-25",
  "endDate": "2026-10-30",
  "branch": "674xxx",
  "paymentMethod": "cash",
  "customerInfo": {
    "name": "Phan Văn Sang",
    "phone": "0909000111",
    "idCard": "012345678901",
    "address": "TP.HCM"
  }
}
```

Trả máy (staff):
```json
{
  "conditionRate": 95,
  "conditionNote": "Có xước nhẹ viền dưới",
  "damageFee": 200000,
  "images": ["url1", "url2"]
}
```

### 4️⃣ Buyback - Thu mua sản phẩm cũ

**Luồng:** `pending → appraising → appraised → accepted/rejected → completed`

```http
GET /api/buyback                       # Danh sách
GET /api/buyback/:id                   # Chi tiết
POST /api/buyback                      # Khách tạo yêu cầu
PATCH /api/buyback/:id/assign          # Staff giao cho chuyên viên
PATCH /api/buyback/:id/estimate        # Chuyên viên định giá online
PATCH /api/buyback/:id/accept          # Khách đồng ý
PATCH /api/buyback/:id/reject          # Từ chối
PATCH /api/buyback/:id/complete        # Hoàn tất thu mua
```

Tạo yêu cầu thu mua:
```json
{
  "branch": "674xxx",
  "productName": "iPhone 13 Pro 256GB",
  "category": "674xxx",
  "brand": "Apple",
  "yearOfPurchase": 2022,
  "description": "Máy dùng tốt, có box sạc",
  "condition": {
    "rate": 95,
    "label": "like_new",
    "batteryHealth": 88,
    "hasBox": true,
    "hasCharger": true,
    "hasInvoice": true
  },
  "images": [{ "url": "url1", "type": "front" }],
  "expectedPrice": 15000000
}
```

Định giá:
```json
{
  "estimatedPrice": 14500000,
  "appraisalNotes": "Máy đẹp, pin 88%, giá hợp lý"
}
```

Hoàn tất thu mua + tạo ProductItem:
```json
{
  "finalPrice": 14500000,
  "productItemData": {
    "product": "674xxx",
    "branch": "674xxx",
    "serialNumber": "SNxxx",
    "conditionRate": 95,
    "salePrice": 18990000,
    "status": "available"
  }
}
```

### 5️⃣ Consignments - Ký gửi bán hộ

**Luồng:** `pending → active → sold/returned/cancelled`

```http
GET /api/consignments
GET /api/consignments/:id
POST /api/consignments                # Tạo ký gửi
PATCH /api/consignments/:id/approve   # Duyệt (Staff)
PATCH /api/consignments/:id/sold      # Đã bán (Staff)
PATCH /api/consignments/:id/return    # Trả lại hàng (Staff)
PATCH /api/consignments/:id/cancel    # Hủy
DELETE /api/consignments/:id          # Xóa (Admin)
```

Tạo ký gửi:
```json
{
  "branch": "674xxx",
  "startDate": "2026-10-19",
  "endDate": "2026-12-19",
  "salePrice": 18000000,
  "minimumPrice": 16500000,
  "commissionRate": 15,
  "terms": "Bán trong 60 ngày",
  "productItemData": {
    "product": "674xxx",
    "conditionRate": 98,
    "conditionLabel": "like_new",
    "batteryHealth": 95,
    "serialNumber": "SNxxx",
    "imei": "35xxx",
    "salePrice": 18000000
  }
}
```

### 6️⃣ Posts - Blog / Tin tức

```http
GET /api/posts                       # Public: chỉ published
GET /api/posts?category=review       # Lọc category
GET /api/posts?q=iphone              # Tìm kiếm
GET /api/posts/:slug                 # Chi tiết (tăng view)
GET /api/posts/admin/all             # Staff: cả draft
POST /api/posts                      # Tạo (Staff)
PUT /api/posts/:id                   # Sửa
DELETE /api/posts/:id                # Xóa (Admin)
```

---

## 🔄 Tích hợp Product + ProductItem

Khi lấy chi tiết 1 Product, API trả về luôn items và stats:

```http
GET /api/products/iphone-15-pro-256gb
```

```json
{
  "status": "success",
  "data": {
    "product": { "_id": "...", "name": "iPhone 15 Pro 256GB", "price": 22990000, ... },
    "items": [
      {
        "_id": "...",
        "branch": { "name": "Chi nhánh Tân Phú" },
        "conditionRate": 97,
        "batteryHealth": 98,
        "salePrice": 19775000,
        "rentalPricePerDay": 99000,
        "status": "available"
      }
    ],
    "stats": {
      "total": 2,
      "minPrice": 17614000,
      "maxPrice": 19775000,
      "avgPrice": 18694500,
      "forSale": 2,
      "forRent": 2,
      "avgCondition": 96
    }
  }
}
```

---

## ⚠️ HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad request (validation fail)
- `401` - Unauthorized (thiếu/không hợp lệ token)
- `403` - Forbidden (không đủ quyền)
- `404` - Not found
- `500` - Server error

## 🔒 Roles & Permissions

| Role | Quyền |
|------|-------|
| `user` (customer) | Xem, đặt đơn, gửi buyback, ký gửi |
| `staff` | Thêm/sửa products, items; duyệt đơn |
| `admin` | Tất cả + xóa, quản lý user |
