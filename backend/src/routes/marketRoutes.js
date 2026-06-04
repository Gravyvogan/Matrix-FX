const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const marketService = require('../services/marketService');
const logger = require('../utils/logger');

// Get current price for a pair
router.get('/price/:pair', auth, async (req, res) => {
  try {
    const { pair } = req.params;
    const price = await marketService.getCurrentPrice(pair);

    res.json({
      success: true,
      data: {
        pair,
        price,
        timestamp: new Date()
      }
    });
  } catch (error) {
    logger.error('Get price error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch price'
    });
  }
});

// Get historical data
router.get('/history/:pair', auth, async (req, res) => {
  try {
    const { pair } = req.params;
    const { timeframe = '1h', limit = 100 } = req.query;

    const data = await marketService.getHistoricalData(pair, timeframe, limit);

    res.json({
      success: true,
      data: {
        pair,
        timeframe,
        candles: data
      }
    });
  } catch (error) {
    logger.error('Get history error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch historical data'
    });
  }
});

// Get popular pairs
router.get('/pairs', auth, async (req, res) => {
  try {
    const pairs = [
      'EUR/USD',
      'GBP/USD',
      'USD/JPY',
      'USD/CHF',
      'AUD/USD',
      'USD/CAD',
      'NZD/USD',
      'EUR/GBP',
      'EUR/JPY',
      'GBP/JPY'
    ];

    res.json({
      success: true,
      data: pairs
    });
  } catch (error) {
    logger.error('Get pairs error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pairs'
    });
  }
});

module.exports = router;
