/**
 * Product Routes
 */

const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/auth');

// Public routes — các path cụ thể phải đặt TRƯỚC /:slug
// nếu không sẽ bị shadow (ví dụ /admin/all → slug = "admin")
router.get('/search', productController.searchProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/best-sellers', productController.getBestSellers);
router.get('/related/:id', productController.getRelatedProducts);
router.get('/', productController.getProducts);

// Admin routes — cũng phải trước /:slug
router.get('/admin/all', adminOnly, productController.getAdminProducts);

// Detail (slug) — đặt cuối để không shadow các route trên
router.get('/:slug', productController.getProduct);

// Admin mutations
router.post('/', adminOnly, productController.createProduct);
router.put('/:id', adminOnly, productController.updateProduct);
router.delete('/:id', adminOnly, productController.deleteProduct);
router.patch('/:id/toggle-featured', adminOnly, productController.toggleFeatured);

module.exports = router;
