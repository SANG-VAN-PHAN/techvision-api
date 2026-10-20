/**
 * Order Routes
 */

const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/auth');

// User routes
router.get('/', protect, orderController.getMyOrders);
router.post('/', protect, orderController.createOrder);
router.patch('/:id/cancel', protect, orderController.cancelOrder);
router.get('/:id', protect, orderController.getOrder);

// Admin routes — PHẢI đặt trước /:id, nếu không sẽ bị shadow
// vào /:id với id = "admin"
router.get('/admin/all', adminOnly, orderController.getAdminOrders);
router.get('/admin/stats', adminOnly, orderController.getOrderStats);
router.patch('/admin/:id/status', adminOnly, orderController.updateOrderStatus);

module.exports = router;
