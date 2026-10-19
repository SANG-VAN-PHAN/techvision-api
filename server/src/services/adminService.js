/**
 * Admin Service - Setup default admin account
 */

const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');

const setupAdmin = async () => {
    try {
        // Create admin account if not exists
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@techvision.vn';
        const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@2026';

        const existingAdmin = await User.findOne({ email: adminEmail });

        if (!existingAdmin) {
            await User.create({
                email: adminEmail,
                password: adminPassword,
                name: 'Administrator',
                role: 'admin',
                isActive: true
            });
            console.log('✅ Admin account created');
            console.log(`   Email: ${adminEmail}`);
            console.log(`   Password: ${adminPassword}`);
        } else {
            console.log('ℹ️  Admin account already exists');
        }

        // Create default categories
        const defaultCategories = [
            { name: 'Điện thoại', icon: '📱', order: 1 },
            { name: 'Laptop', icon: '💻', order: 2 },
            { name: 'Tablet', icon: '📲', order: 3 },
            { name: 'Smartwatch', icon: '⌚', order: 4 },
            { name: 'Tai nghe', icon: '🎧', order: 5 },
            { name: 'Loa', icon: '🔊', order: 6 },
            { name: 'Camera', icon: '📷', order: 7 },
            { name: 'Phụ kiện', icon: '🎒', order: 8 }
        ];

        for (const cat of defaultCategories) {
            const existing = await Category.findOne({ name: cat.name });
            if (!existing) {
                await Category.create(cat);
                console.log(`✅ Category "${cat.name}" created`);
            }
        }

        // Create sample products
        const phoneCategory = await Category.findOne({ name: 'Điện thoại' });
        const headphoneCategory = await Category.findOne({ name: 'Tai nghe' });
        const watchCategory = await Category.findOne({ name: 'Smartwatch' });
        const speakerCategory = await Category.findOne({ name: 'Loa' });
        const cameraCategory = await Category.findOne({ name: 'Camera' });
        const laptopCategory = await Category.findOne({ name: 'Laptop' });

        if (phoneCategory) {
            const sampleProducts = [
                {
                    name: 'iPhone 16 Pro Max',
                    sku: 'IPHONE16PM',
                    brand: 'Apple',
                    description: 'iPhone mạnh nhất từ trước đến nay với chip A18 Pro, màn hình Super Retina XDR 6.9 inch, camera 48MP và tính năng Apple Intelligence.',
                    shortDescription: 'iPhone mạnh nhất với A18 Pro chip',
                    price: 34990000,
                    originalPrice: 34990000,
                    category: phoneCategory._id,
                    stock: 50,
                    isActive: true,
                    isFeatured: true,
                    isNew: true,
                    features: ['A18 Pro', '48MP Camera', '6.9" OLED', 'Titanium', '5G'],
                    images: [{ url: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-16-pro-finish-select-202409-6-3inch_GEO_VN?wid=400', isPrimary: true }]
                },
                {
                    name: 'Samsung Galaxy S24 Ultra',
                    sku: 'SAMS24U',
                    brand: 'Samsung',
                    description: 'Flagship Samsung với S Pen tích hợp, camera 200MP, màn hình Dynamic AMOLED 2X 6.8 inch và AI features.',
                    shortDescription: 'Flagship với S Pen và AI',
                    price: 27990000,
                    originalPrice: 31990000,
                    category: phoneCategory._id,
                    stock: 35,
                    isActive: true,
                    isFeatured: true,
                    features: ['200MP Camera', 'S Pen', 'Snapdragon 8 Gen 3', '6.8" AMOLED'],
                    images: [{ url: 'https://images.samsung.com/is/image/samsung/p6pim/vn/sm-s928bzabeub/gallery/vn-galaxy-s24-ultra-s928-sm-s928bzabeub-thumb-539573965', isPrimary: true }]
                },
                {
                    name: 'Xiaomi 14 Ultra',
                    sku: 'XIA14U',
                    brand: 'Xiaomi',
                    description: 'Camera Leica 1 inch với khả năng chụp ảnh chuyên nghiệp, chip Snapdragon 8 Gen 3 và sạc nhanh 90W.',
                    shortDescription: 'Camera Leica 1 inch',
                    price: 21990000,
                    originalPrice: 24990000,
                    category: phoneCategory._id,
                    stock: 25,
                    isActive: true,
                    features: ['Leica Camera', 'Snapdragon 8 Gen 3', '90W Charging', '1" Sensor'],
                    images: [{ url: 'https://i02.appmifile.com/220_operatorx_operatorx_opx/11/01/2024/f13d31fc82be03e2f6e3b8f6e3e3e3e3.png', isPrimary: true }]
                }
            ];

            for (const product of sampleProducts) {
                const existing = await Product.findOne({ sku: product.sku });
                if (!existing) {
                    await Product.create(product);
                    console.log(`✅ Product "${product.name}" created`);
                }
            }
        }

        // Create sample coupons
        const sampleCoupons = [
            { code: 'WELCOME10', name: 'Chào mừng thành viên mới', type: 'percentage', value: 10, maxDiscount: 500000, minOrderAmount: 200000, description: 'Giảm 10% cho đơn hàng từ 200K', newUsersOnly: true },
            { code: 'SUMMER20', name: 'Khuyến mãa mùa hè', type: 'percentage', value: 20, maxDiscount: 1000000, minOrderAmount: 500000, endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
            { code: 'FREESHIP', name: 'Miễn phí vận chuyển', type: 'free_shipping', value: 0, minOrderAmount: 300000 },
            { code: 'VIP500K', name: 'VIP 500K', type: 'fixed', value: 500000, minOrderAmount: 2000000, maxOrderAmount: 5000000 }
        ];

        for (const coupon of sampleCoupons) {
            const existing = await Coupon.findOne({ code: coupon.code });
            if (!existing) {
                await Coupon.create(coupon);
                console.log(`✅ Coupon "${coupon.code}" created`);
            }
        }

        console.log('✅ Database setup complete!');
    } catch (error) {
        console.error('❌ Database setup error:', error);
    }
};

module.exports = { setupAdmin };
