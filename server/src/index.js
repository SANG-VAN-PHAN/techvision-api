/**
 * TechVision E-Commerce Server
 * Main Entry Point
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
// ==================== DATABASE CONFIG ====================
const connectDB = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const orderRoutes = require('./routes/orders');
const couponRoutes = require('./routes/coupons');
const paymentRoutes = require('./routes/payments');
const adminRoutes = require('./routes/admin');
const branchRoutes = require('./routes/branches');
const productItemRoutes = require('./routes/productItems');
const rentalRoutes = require('./routes/rentals');
const buybackRoutes = require('./routes/buyback');
const postRoutes = require('./routes/posts');
const consignmentRoutes = require('./routes/consignments');
const dashboardRoutes = require('./routes/dashboard');

// Import middleware
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// ==================== SECURITY MIDDLEWARE ====================

// Helmet for security headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:", "https:", "blob:"],
            connectSrc: ["'self'", "https://accounts.google.com", "https://graph.facebook.com"]
        }
    }
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: { error: 'Quá nhiều yêu cầu, vui lòng thử lại sau.' }
});
app.use('/api/', limiter);

// Stricter rate limit for auth routes
const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // limit each IP to 10 login attempts per hour
    message: { error: 'Quá nhiều lần đăng nhập, vui lòng thử lại sau 1 giờ.' }
});
app.use('/api/auth/login', authLimiter);

// ==================== CORS ====================
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// ==================== BODY PARSER ====================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ==================== MORGAN LOGGING ====================
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// ==================== STATIC FILES ====================
app.use('/public', express.static(path.join(__dirname, '../public')));

// ==================== API ROUTES ====================
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/product-items', productItemRoutes);
app.use('/api/rentals', rentalRoutes);
app.use('/api/buyback', buybackRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/consignments', consignmentRoutes);
app.use('/api/admin/dashboard', dashboardRoutes);

// Health check (nhẹ, dùng cho keep-alive)
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0'
    });
});

// Ping endpoint đơn giản (rất nhẹ, chỉ trả OK)
app.get('/ping', (req, res) => {
    res.status(200).send('pong');
});

// ==================== ERROR HANDLING ====================
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint không tìm thấy' });
});

// ==================== START SERVER ====================
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    await connectDB();
    
    app.listen(PORT, () => {
        console.log(`
╔══════════════════════════════════════════════════════╗
║                                                      ║
║   ⚡ TechVision E-Commerce Server                    ║
║   🚀 Running on port ${PORT}                           ║
║   📦 Environment: ${process.env.NODE_ENV || 'development'}                  ║
║                                                      ║
║   Endpoints:                                         ║
║   • API:    http://localhost:${PORT}/api               ║
║   • Admin:  http://localhost:${PORT}/admin             ║
║   • Health: http://localhost:${PORT}/api/health         ║
║                                                      ║
╚══════════════════════════════════════════════════════╝
        `);
    });
};

startServer();

module.exports = app;
