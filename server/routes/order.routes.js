
const express = require('express');
const Order = require('../models/order.model');
const Cart = require('../models/cart.model');
const User = require('../models/user.model');
const authMiddleware = require('../middleware/auth.middleware');
const router = express.Router();

// Get user's orders
router.get('/', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get order by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if user is authorized to view this order
    if (order.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create a new order
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { shippingAddress, paymentMethod, useWalletBalance } = req.body;
    
    // Get user's cart
    const cart = await Cart.findOne({ userId: req.userId });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }
    
    // Calculate total
    const totalAmount = cart.items.reduce(
      (total, item) => total + item.price * item.quantity, 
      0
    );
    
    // Check if using wallet balance
    let walletAmountUsed = 0;
    if (useWalletBalance) {
      // Get user to check balance
      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Calculate how much of wallet balance to use
      walletAmountUsed = Math.min(user.balance, totalAmount);
      
      // Deduct from user's wallet
      user.balance -= walletAmountUsed;
      await user.save();
    }
    
    // Create order
    const order = new Order({
      userId: req.userId,
      items: cart.items,
      totalAmount,
      walletAmountUsed,
      cardAmountPaid: totalAmount - walletAmountUsed,
      shippingAddress,
      paymentMethod,
      status: 'processing'
    });
    
    await order.save();
    
    // Clear cart after order is placed
    cart.items = [];
    cart.updatedAt = Date.now();
    await cart.save();
    
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get seller's sales
router.get('/sales/seller', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ 'items.sellerId': req.userId });
    
    // Extract only the items sold by this seller from each order
    const sales = orders.map(order => {
      const sellerItems = order.items.filter(
        item => item.sellerId.toString() === req.userId.toString()
      );
      
      return {
        orderId: order._id,
        orderDate: order.createdAt,
        items: sellerItems,
        status: order.status
      };
    });
    
    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update order status (for admin functionality later)
router.put('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // For now, only let users update their own orders
    // Can be expanded later for admin functionality
    if (order.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this order' });
    }
    
    order.status = status;
    await order.save();
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
