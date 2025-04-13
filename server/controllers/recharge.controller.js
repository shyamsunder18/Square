
const User = require('../models/user.model');

// Get UPI information
const getUpiInfo = async (req, res) => {
  try {
    // Read from .env for now, later could be stored in a settings collection
    const upiInfo = {
      image: process.env.UPI_IMAGE_URL || 'https://via.placeholder.com/300x300?text=UPI+QR+Code',
      upiId: process.env.UPI_ID || 'example@upi',
      instructions: 'Scan the QR code to pay and then submit the UTR number for verification.'
    };
    
    res.json(upiInfo);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Submit a recharge request
const submitRechargeRequest = async (req, res) => {
  try {
    const { amount, utrId } = req.body;
    
    if (!amount || !utrId) {
      return res.status(400).json({ message: 'Amount and UTR ID are required' });
    }
    
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const rechargeRequest = {
      amount: Number(amount),
      utrId,
      status: 'pending',
      pointsAdded: 0,
      bonusPoints: 0,
      createdAt: new Date()
    };
    
    user.rechargeHistory.push(rechargeRequest);
    await user.save();
    
    res.status(201).json({ 
      message: 'Recharge request submitted successfully',
      rechargeId: user.rechargeHistory[user.rechargeHistory.length - 1]._id
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all pending recharge requests (admin only)
const getPendingRequests = async (req, res) => {
  try {
    const users = await User.find({ 'rechargeHistory.status': 'pending' })
      .select('name email rechargeHistory');
    
    let pendingRequests = [];
    users.forEach(user => {
      const userPendingRequests = user.rechargeHistory
        .filter(recharge => recharge.status === 'pending')
        .map(recharge => ({
          rechargeId: recharge._id,
          userId: user._id,
          userName: user.name,
          userEmail: user.email,
          amount: recharge.amount,
          utrId: recharge.utrId,
          date: recharge.createdAt
        }));
      
      pendingRequests = [...pendingRequests, ...userPendingRequests];
    });
    
    res.json(pendingRequests);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Approve a recharge request (admin only)
const approveRechargeRequest = async (req, res) => {
  try {
    const { userId, rechargeId } = req.params;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const recharge = user.rechargeHistory.id(rechargeId);
    
    if (!recharge) {
      return res.status(404).json({ message: 'Recharge request not found' });
    }
    
    if (recharge.status !== 'pending') {
      return res.status(400).json({ message: 'This request has already been processed' });
    }
    
    const amount = recharge.amount;
    let bonusPoints = 0;
    
    // Calculate bonus points
    const userHasPreviousRecharge = user.rechargeHistory.some(
      r => r.status === 'approved' && r._id.toString() !== rechargeId
    );
    
    if (!userHasPreviousRecharge && amount >= 1000) {
      bonusPoints = 50;
    } else {
      bonusPoints = Math.floor(amount * 0.045);
    }
    
    const pointsToAdd = amount + bonusPoints;
    
    // Update recharge status and add points
    recharge.status = 'approved';
    recharge.pointsAdded = amount;
    recharge.bonusPoints = bonusPoints;
    
    // Update user balance
    user.balance = (user.balance || 0) + pointsToAdd;
    
    await user.save();
    
    res.json({ 
      message: 'Recharge approved successfully',
      pointsAdded: amount,
      bonusPoints,
      newBalance: user.balance
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Reject a recharge request (admin only)
const rejectRechargeRequest = async (req, res) => {
  try {
    const { userId, rechargeId } = req.params;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const recharge = user.rechargeHistory.id(rechargeId);
    
    if (!recharge) {
      return res.status(404).json({ message: 'Recharge request not found' });
    }
    
    if (recharge.status !== 'pending') {
      return res.status(400).json({ message: 'This request has already been processed' });
    }
    
    // Update recharge status
    recharge.status = 'rejected';
    await user.save();
    
    res.json({ message: 'Recharge request rejected' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update UPI Info (admin only)
const updateUpiInfo = async (req, res) => {
  try {
    const { image, upiId } = req.body;
    
    process.env.UPI_IMAGE_URL = image;
    process.env.UPI_ID = upiId;
    
    res.json({ message: 'UPI information updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user recharge history
const getUserRechargeHistory = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      balance: user.balance,
      rechargeHistory: user.rechargeHistory
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getUpiInfo,
  submitRechargeRequest,
  getPendingRequests,
  approveRechargeRequest,
  rejectRechargeRequest,
  updateUpiInfo,
  getUserRechargeHistory
};
