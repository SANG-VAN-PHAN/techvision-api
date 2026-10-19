/**
 * Product Controller
 */

const Product = require('../models/Product');
const Category = require('../models/Category');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

// @route   GET /api/products
// @desc    Get all products with filtering, sorting, pagination
// @access  Public
exports.getProducts = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 12,
        sort = '-createdAt',
        category,
        brand,
        minPrice,
        maxPrice,
        search,
        featured,
        new: isNew,
        inStock
    } = req.query;

    // Build query
    const query = { isActive: true };

    if (category) {
        const cat = await Category.findOne({ slug: category });
        if (cat) {
            query.category = cat._id;
        }
    }

    if (brand) {
        query.brand = { $regex: brand, $options: 'i' };
    }

    if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (search) {
        query.$text = { $search: search };
    }

    if (featured === 'true') {
        query.isFeatured = true;
    }

    if (isNew === 'true') {
        query.isNew = true;
    }

    if (inStock === 'true') {
        query.stock = { $gt: 0 };
    }

    // Execute query
    const skip = (Number(page) - 1) * Number(limit);
    
    const [products, total] = await Promise.all([
        Product.find(query)
            .populate('category', 'name slug')
            .select('-__v')
            .sort(sort)
            .skip(skip)
            .limit(Number(limit)),
        Product.countDocuments(query)
    ]);

    res.json({
        status: 'success',
        data: {
            products,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        }
    });
});

// @route   GET /api/products/:slug
// @desc    Get single product by slug (with items + stats)
// @access  Public
exports.getProduct = asyncHandler(async (req, res) => {
    const ProductItem = require('../models/ProductItem');
    const product = await Product.findOne({
        slug: req.params.slug,
        isActive: true
    })
    .populate('category', 'name slug');

    if (!product) {
        throw new AppError('Sản phẩm không tìm thấy!', 404);
    }

    // Lấy items + thống kê
    const [items, stats] = await Promise.all([
        ProductItem.find({ product: product._id })
            .populate('branch', 'name city')
            .sort('-createdAt'),
        ProductItem.aggregate([
            { $match: { product: product._id, status: 'available' } },
            { $group: {
                _id: null,
                total: { $sum: 1 },
                minPrice: { $min: '$salePrice' },
                maxPrice: { $max: '$salePrice' },
                avgPrice: { $avg: '$salePrice' },
                forSale: { $sum: { $cond: ['$isForSale', 1, 0] } },
                forRent: { $sum: { $cond: ['$isForRent', 1, 0] } },
                avgCondition: { $avg: '$conditionRate' }
            }}
        ])
    ]);

    // Increment view count
    product.viewCount += 1;
    await product.save();

    res.json({
        status: 'success',
        data: {
            product,
            items,
            stats: stats[0] || {
                total: 0, minPrice: product.price, maxPrice: product.price, avgPrice: product.price,
                forSale: 0, forRent: 0, avgCondition: 0
            }
        }
    });
});

// @route   GET /api/products/related/:id
// @desc    Get related products
// @access  Public
exports.getRelatedProducts = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
        throw new AppError('Sản phẩm không tìm thấy!', 404);
    }

    const relatedProducts = await Product.find({
        _id: { $ne: product._id },
        category: product.category,
        isActive: true
    })
    .select('name slug price images rating sold')
    .limit(8);

    res.json({
        status: 'success',
        data: { products: relatedProducts }
    });
});

// @route   GET /api/products/featured
// @desc    Get featured products
// @access  Public
exports.getFeaturedProducts = asyncHandler(async (req, res) => {
    const products = await Product.find({ 
        isActive: true, 
        isFeatured: true 
    })
    .populate('category', 'name slug')
    .select('-__v')
    .sort('-createdAt')
    .limit(Number(req.query.limit) || 8);

    res.json({
        status: 'success',
        data: { products }
    });
});

// @route   GET /api/products/best-sellers
// @desc    Get best selling products
// @access  Public
exports.getBestSellers = asyncHandler(async (req, res) => {
    const products = await Product.find({ 
        isActive: true,
        sold: { $gt: 0 }
    })
    .populate('category', 'name slug')
    .select('-__v')
    .sort('-sold')
    .limit(Number(req.query.limit) || 8);

    res.json({
        status: 'success',
        data: { products }
    });
});

// @route   GET /api/products/search
// @desc    Search products
// @access  Public
exports.searchProducts = asyncHandler(async (req, res) => {
    const { q, limit = 10 } = req.query;

    if (!q) {
        throw new AppError('Vui lòng nhập từ khóa tìm kiếm!', 400);
    }

    const products = await Product.find({
        $text: { $search: q },
        isActive: true
    })
    .select('name slug price images thumbnail')
    .limit(Number(limit));

    res.json({
        status: 'success',
        data: { products }
    });
});

// ==================== ADMIN CONTROLLERS ====================

// @route   POST /api/products
// @desc    Create product
// @access  Private/Admin
exports.createProduct = asyncHandler(async (req, res) => {
    const product = await Product.create(req.body);

    res.status(201).json({
        status: 'success',
        message: 'Tạo sản phẩm thành công!',
        data: { product }
    });
});

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Private/Admin
exports.updateProduct = asyncHandler(async (req, res) => {
    const product = await Product.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    );

    if (!product) {
        throw new AppError('Sản phẩm không tìm thấy!', 404);
    }

    res.json({
        status: 'success',
        message: 'Cập nhật sản phẩm thành công!',
        data: { product }
    });
});

// @route   DELETE /api/products/:id
// @desc    Delete product
// @access  Private/Admin
exports.deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
        throw new AppError('Sản phẩm không tìm thấy!', 404);
    }

    res.json({
        status: 'success',
        message: 'Xóa sản phẩm thành công!'
    });
});

// @route   PATCH /api/products/:id/toggle-featured
// @desc    Toggle featured status
// @access  Private/Admin
exports.toggleFeatured = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        throw new AppError('Sản phẩm không tìm thấy!', 404);
    }

    product.isFeatured = !product.isFeatured;
    await product.save();

    res.json({
        status: 'success',
        message: product.isFeatured ? 'Sản phẩm đã được đánh dấu nổi bật!' : 'Đã bỏ đánh dấu nổi bật!',
        data: { isFeatured: product.isFeatured }
    });
});

// @route   GET /api/products/admin/all
// @desc    Get all products for admin
// @access  Private/Admin
exports.getAdminProducts = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, status } = req.query;

    const query = {};
    if (status === 'active') query.isActive = true;
    if (status === 'inactive') query.isActive = false;

    const [products, total] = await Promise.all([
        Product.find(query)
            .populate('category', 'name')
            .select('-__v')
            .sort('-createdAt')
            .skip((page - 1) * limit)
            .limit(limit),
        Product.countDocuments(query)
    ]);

    res.json({
        status: 'success',
        data: {
            products,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        }
    });
});
