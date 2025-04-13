
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const adminMiddleware = require('../middleware/admin.middleware');
const rechargeController = require('../controllers/recharge.controller');

// Public routes
router.get('/upi-info', authMiddleware, rechargeController.getUpiInfo);
router.post('/request', authMiddleware, rechargeController.submitRechargeRequest);
router.get('/history', authMiddleware, rechargeController.getUserRechargeHistory);

// Admin routes
router.get('/pending', authMiddleware, adminMiddleware, rechargeController.getPendingRequests);
router.post('/approve/:userId/:rechargeId', authMiddleware, adminMiddleware, rechargeController.approveRechargeRequest);
router.post('/reject/:userId/:rechargeId', authMiddleware, adminMiddleware, rechargeController.rejectRechargeRequest);
router.post('/update-upi-info', authMiddleware, adminMiddleware, rechargeController.updateUpiInfo);

module.exports = router;
