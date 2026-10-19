/**
 * Order Routes
 */

const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/auth');

// User routes
router.get('/', protect, orderController.getMyOrders);
router.get('/:id', protect, orderController.getOrder);
router.post('/', protect, orderController.createOrder);
router.patch('/:id/cancel', protect, orderController.cancelOrder);

// Admin routes
router.get('/admin/all', adminOnly, orderController.getAdminOrders);
router.patch('/admin/:id/status', adminOnly, orderController.updateOrderStatus);
router.get('/admin/stats', adminOnly, orderController.getOrderStats);

module.exports = router;
