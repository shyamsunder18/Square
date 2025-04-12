
const express = require('express');
const Product = require('../models/product.model');
const Order = require('../models/order.model');
const authMiddleware = require('../middleware/auth.middleware');
const router = express.Router();

// Add a review to product
router.post('/:productId', authMiddleware, async (req, res) => {
  try {
    const { rating, comment, orderId } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }
    
    // Find the product
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Verify the order exists and belongs to this user
    if (orderId) {
      const order = await Order.findById(orderId);
      
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      
      if (order.userId.toString() !== req.userId.toString()) {
        return res.status(403).json({ message: 'Not authorized to review this order' });
      }
      
      // Check if user has already reviewed this product for this order
      const existingReview = product.reviews?.find(
        review => 
          review.userId.toString() === req.userId.toString() && 
          review.orderId?.toString() === orderId
      );
      
      if (existingReview) {
        return res.status(400).json({ message: 'You have already reviewed this product for this order' });
      }
      
      // Mark item as reviewed in the order
      const itemIndex = order.items.findIndex(
        item => item.productId.toString() === req.params.productId
      );
      
      if (itemIndex !== -1) {
        order.items[itemIndex].reviewed = true;
        await order.save();
      }
    }
    
    // Create the review
    const review = {
      userId: req.userId,
      userName: req.user.name,
      orderId: orderId || null,
      rating,
      comment,
      createdAt: new Date()
    };
    
    // Add review to product
    if (!product.reviews) {
      product.reviews = [];
    }
    
    product.reviews.push(review);
    
    // Recalculate average rating
    const sum = product.reviews.reduce((acc, review) => acc + review.rating, 0);
    product.averageRating = sum / product.reviews.length;
    
    await product.save();
    
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get reviews for a product
router.get('/product/:productId', async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json({
      reviews: product.reviews || [],
      averageRating: product.averageRating || 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
