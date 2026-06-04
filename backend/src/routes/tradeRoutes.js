const express = require('express');
const router = express.Router();
const Trade = require('../models/Trade');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const tradingService = require('../services/tradingService');
const logger = require('../utils/logger');

// Get user's trades
router.get('/', auth, async (req, res) => {
  try {
    const { status = 'all', pair } = req.query;

    let query = { userId: req.userId };
    if (status !== 'all') query.status = status;
    if (pair) query.pair = pair;

    const trades = await Trade.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: trades
    });
  } catch (error) {
    logger.error('Get trades error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trades'
    });
  }
});

// Get single trade
router.get('/:id', auth, async (req, res) => {
  try {
    const trade = await Trade.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!trade) {
      return res.status(404).json({
        success: false,
        message: 'Trade not found'
      });
    }

    res.json({
      success: true,
      data: trade
    });
  } catch (error) {
    logger.error('Get trade error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trade'
    });
  }
});

// Create trade
router.post('/', auth, async (req, res) => {
  try {
    const { pair, type, quantity, entryPrice, stopLoss, takeProfit } = req.body;

    if (!pair || !type || !quantity || !entryPrice) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    const trade = await Trade.create({
      userId: req.userId,
      pair: pair.toUpperCase(),
      type: type.toUpperCase(),
      quantity,
      entryPrice,
      stopLoss,
      takeProfit,
      status: 'OPEN'
    });

    logger.info(`Trade created: ${trade._id}`);

    res.status(201).json({
      success: true,
      data: trade
    });
  } catch (error) {
    logger.error('Create trade error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to create trade'
    });
  }
});

// Close trade
router.put('/:id/close', auth, async (req, res) => {
  try {
    const { exitPrice } = req.body;

    if (!exitPrice) {
      return res.status(400).json({
        success: false,
        message: 'Please provide exit price'
      });
    }

    const trade = await Trade.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!trade) {
      return res.status(404).json({
        success: false,
        message: 'Trade not found'
      });
    }

    trade.closeTrade(exitPrice);
    await trade.save();

    // Update user account balance
    const user = await User.findById(req.userId);
    user.accountBalance += trade.profit;
    await user.save();

    logger.info(`Trade closed: ${trade._id}, Profit: ${trade.profit}`);

    res.json({
      success: true,
      data: trade
    });
  } catch (error) {
    logger.error('Close trade error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to close trade'
    });
  }
});

// Get trading statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const trades = await Trade.find({
      userId: req.userId,
      status: 'CLOSED'
    });

    const totalTrades = trades.length;
    const winningTrades = trades.filter(t => t.profit > 0).length;
    const losingTrades = trades.filter(t => t.profit < 0).length;
    const totalProfit = trades.reduce((sum, t) => sum + (t.profit || 0), 0);
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
    const averageProfit = totalTrades > 0 ? totalProfit / totalTrades : 0;

    res.json({
      success: true,
      data: {
        totalTrades,
        winningTrades,
        losingTrades,
        totalProfit,
        winRate,
        averageProfit
      }
    });
  } catch (error) {
    logger.error('Get stats error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
});

module.exports = router;
