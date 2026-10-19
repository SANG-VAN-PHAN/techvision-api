# MongoDB Setup Script cho TechVision
# Chạy script này với quyền Administrator

Write-Host "=== TechVision MongoDB Setup ===" -ForegroundColor Cyan

# 1. Kiểm tra MongoDB đã cài chưa
$mongoInstalled = Get-Command mongod -ErrorAction SilentlyContinue

if ($mongoInstalled) {
    Write-Host "MongoDB đã được cài đặt!" -ForegroundColor Green
    mongod --version
} else {
    Write-Host "MongoDB chưa được cài. Đang tải về..." -ForegroundColor Yellow
    
    # Download MongoDB Community Server
    $mongoUrl = "https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-7.0.5-signed.msi"
    $outputPath = "$env:TEMP\mongodb.msi"
    
    Write-Host "Tải MongoDB..." -ForegroundColor Cyan
    Invoke-WebRequest -Uri $mongoUrl -OutFile $outputPath -UseBasicParsing
    
    Write-Host "Cài đặt MongoDB..." -ForegroundColor Cyan
    Start-Process msiexec.exe -ArgumentList "/i `"$outputPath`" /quiet /norestart" -Wait
    
    Write-Host "MongoDB đã được cài đặt!" -ForegroundColor Green
}

# 2. Tạo thư mục data
$dataPath = "C:\data\db"
if (!(Test-Path $dataPath)) {
    New-Item -ItemType Directory -Path $dataPath -Force | Out-Null
    Write-Host "Đã tạo thư mục: $dataPath" -ForegroundColor Green
}

# 3. Tạo thư mục log
$logPath = "C:\data\log"
if (!(Test-Path $logPath)) {
    New-Item -ItemType Directory -Path $logPath -Force | Out-Null
    Write-Host "Đã tạo thư mục: $logPath" -ForegroundColor Green
}

# 4. Tạo config file
$configContent = @"
storage:
  dbPath: C:\data\db
  journal:
    enabled: true
systemLog:
  destination: file
  path: C:\data\log\mongod.log
net:
  port: 27017
  bindIp: 127.0.0.1
"@

$configPath = "C:\Program Files\MongoDB\Server\7.0\bin\mongod.cfg"
# Note: Config path có thể khác, kiểm tra sau khi cài

Write-Host ""
Write-Host "=== Hướng dẫn khởi động ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Cách 1: Chạy thủ công (mỗi lần cần)" -ForegroundColor Yellow
Write-Host '  mongod --dbpath C:\data\db --logpath C:\data\log\mongod.log'
Write-Host ""
Write-Host "Cách 2: Tạo Service (chạy nền tự động)" -ForegroundColor Yellow
Write-Host '  mongod --dbpath C:\data\db --logpath C:\data\log\mongod.log --install'
Write-Host '  net start MongoDB'
Write-Host ""
Write-Host "=== Kiểm tra ===" -ForegroundColor Cyan
Write-Host '  mongo --eval "db.version()"'
Write-Host ""

# 5. Cập nhật .env
Write-Host "Cập nhật cấu hình..." -ForegroundColor Cyan
