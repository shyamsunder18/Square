
const express = require('express');
const router = express.Router();
const Product = require('../models/product.model');
const Order = require('../models/order.model');
const authMiddleware = require('../middleware/auth.middleware');

// Get personalized recommendations for a logged-in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Get user's previous orders
    const userOrders = await Order.find({ userId: req.userId });
    
    // Extract product IDs from orders
    let purchasedProductIds = [];
    let purchasedCategories = new Set();
    
    userOrders.forEach(order => {
      order.items.forEach(item => {
        purchasedProductIds.push(item.productId);
        if (item.category) {
          purchasedCategories.add(item.category);
        }
      });
    });
    
    // Create an array from the Set for easier use
    const categories = Array.from(purchasedCategories);
    
    // If user has purchase history, recommend based on categories they've bought from
    let recommendations;
    
    if (categories.length > 0) {
      // Find products in categories the user has purchased from
      // but exclude products they've already purchased
      recommendations = await Product.find({
        category: { $in: categories },
        _id: { $nin: purchasedProductIds }
      }).limit(10);
      
      // If we don't have enough category-based recommendations, add some general popular products
      if (recommendations.length < 5) {
        const popularProducts = await Product.find({
          _id: { $nin: [...purchasedProductIds, ...recommendations.map(p => p._id)] }
        })
        .sort({ averageRating: -1 })
        .limit(5 - recommendations.length);
        
        recommendations = [...recommendations, ...popularProducts];
      }
    } else {
      // If no purchase history, recommend popular products
      recommendations = await Product.find()
        .sort({ averageRating: -1 })
        .limit(10);
    }
    
    res.json(recommendations);
  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get recommendations for specific product
router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    
    // Find the product
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Find related products in the same category
    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id }
    })
    .sort({ averageRating: -1 })
    .limit(5);
    
    res.json(relatedProducts);
  } catch (error) {
    console.error('Error getting product recommendations:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
