# 🔄 Keep Render Alive - Chống Sleep

Render Free tier sẽ "ngủ" (sleep) sau **15 phút** không có traffic. Workflow này sẽ tự động ping mỗi **14 phút** để giữ service luôn hoạt động.

## ⚙️ Cách hoạt động

```
GitHub Actions (cron) → Ping Render API → Server tỉnh táo → Không sleep
        ↓
Mỗi 14 phút (cron: */14 * * * *)
```

## 📁 File cấu hình

- **Workflow:** `.github/workflows/keep-alive.yml`
- **Health endpoint:** `https://techvision-api.onrender.com/api/health`
- **Ping endpoint:** `https://techvision-api.onrender.com/ping` (rất nhẹ)

## 🚀 Kích hoạt

### Cách 1: Auto (mặc định)
- Workflow đã được cấu hình cron `*/14 * * * *`
- GitHub sẽ tự động chạy mỗi 14 phút
- **Lưu ý:** GitHub Actions có thể delay 5-10 phút, nhưng vẫn trong giới hạn 15 phút của Render

### Cách 2: Chạy thủ công
1. Vào GitHub repo: https://github.com/SANG-VAN-PHAN/techvision-api
2. Tab **Actions**
3. Chọn **"Keep Render Alive"** ở sidebar
4. Click **"Run workflow"** → **"Run workflow"**

### Cách 3: Theo dõi
1. Vào **Actions** tab
2. Xem lịch sử chạy workflow
3. Mỗi lần chạy sẽ hiển thị log ping

## 📊 Thống kê sử dụng GitHub Actions

| Plan | Phút/tháng | Đủ cho keep-alive? |
|------|-----------|-------------------|
| **Free** | 2,000 phút | ✅ Dư dả (chỉ tốn ~720 phút/tháng) |
| Pro | 3,000 phút | ✅ |

**Tính toán:** 14 phút/lần × 24h × 30 ngày = ~1,030 lần/tháng, mỗi lần ~30 giây = ~515 phút/tháng

## 🔍 Kiểm tra hoạt động

### Test thủ công:
```bash
curl https://techvision-api.onrender.com/ping
# Response: pong

curl https://techvision-api.onrender.com/api/health
# Response: {"status":"ok","uptime":1234.56,...}
```

### Xem logs trên Render:
1. Vào https://dashboard.render.com
2. Chọn service **techvision-api**
3. Tab **Logs** → Sẽ thấy mỗi lần ping có request log

## ⚠️ Lưu ý

1. **GitHub Actions delay:** Cron có thể chậm 5-10 phút (đặc biệt khi có nhiều job)
2. **Free tier Render:** 750 giờ/tháng - đủ dùng
3. **Backup plan:** Nếu cần ping chính xác hơn, dùng [cron-job.org](https://cron-job.org) (miễn phí)
4. **Uptime 100%:** Để đảm bảo uptime 100%, nâng cấp lên Render Paid ($7/tháng) - không sleep

## 🎯 Tối ưu

Nếu muốn ping **chính xác hơn 14 phút**, sửa cron:
```yaml
schedule:
  - cron: '*/13 * * * *'  # 13 phút (an toàn hơn)
  - cron: '*/10 * * * *'  # 10 phút (cẩn thận vẫn đủ quota)
```
