/**
 * Product Routes
 */

const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/auth');

// Public routes
router.get('/', productController.getProducts);
router.get('/search', productController.searchProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/best-sellers', productController.getBestSellers);
router.get('/:slug', productController.getProduct);
router.get('/related/:id', productController.getRelatedProducts);

// Admin routes
router.post('/', adminOnly, productController.createProduct);
router.put('/:id', adminOnly, productController.updateProduct);
router.delete('/:id', adminOnly, productController.deleteProduct);
router.patch('/:id/toggle-featured', adminOnly, productController.toggleFeatured);
router.get('/admin/all', adminOnly, productController.getAdminProducts);

module.exports = router;
