const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const logger = require('../utils/logger');

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    logger.error('Get profile error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile'
    });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { firstName, lastName, leverage, riskPercentage, preferredPairs } = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        firstName,
        lastName,
        leverage,
        riskPercentage,
        preferredPairs,
        updatedAt: new Date()
      },
      { new: true }
    ).select('-password');

    logger.info(`User profile updated: ${req.userId}`);

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    logger.error('Update profile error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
});

// Get account balance
router.get('/balance', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    res.json({
      success: true,
      data: {
        balance: user.accountBalance,
        currency: 'USD'
      }
    });
  } catch (error) {
    logger.error('Get balance error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch balance'
    });
  }
});

// Deposit funds
router.post('/deposit', auth, async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid deposit amount'
      });
    }

    const user = await User.findById(req.userId);
    user.accountBalance += amount;
    await user.save();

    logger.info(`Deposit made by ${req.userId}: ${amount}`);

    res.json({
      success: true,
      data: {
        balance: user.accountBalance,
        depositAmount: amount
      }
    });
  } catch (error) {
    logger.error('Deposit error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Deposit failed'
    });
  }
});

module.exports = router;
