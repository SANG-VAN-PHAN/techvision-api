/**
 * Dashboard Routes - Thống kê cho Admin
 */
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { adminOnly } = require('../middleware/auth');

router.get('/overview', adminOnly, dashboardController.getOverview);
router.get('/revenue', adminOnly, dashboardController.getRevenueChart);
router.get('/top-products', adminOnly, dashboardController.getTopProducts);
router.get('/inventory-by-branch', adminOnly, dashboardController.getInventoryByBranch);
router.get('/recent-orders', adminOnly, dashboardController.getRecentOrders);
router.get('/condition-stats', adminOnly, dashboardController.getConditionStats);
router.get('/low-stock', adminOnly, dashboardController.getLowStock);

module.exports = router;
