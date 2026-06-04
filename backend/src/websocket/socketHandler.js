const marketService = require('../services/marketService');
const aiService = require('../services/aiService');
const tradingService = require('../services/tradingService');
const User = require('../models/User');
const logger = require('../utils/logger');

let activePriceFeeds = {};

const socketHandler = (socket, io) => {
  // Subscribe to real-time price updates
  socket.on('subscribe_prices', async (data) => {
    try {
      const { pairs, userId } = data;

      socket.join(`user:${userId}`);
      socket.userId = userId;

      logger.info(`User ${userId} subscribed to prices for: ${pairs.join(', ')}`);

      // Start price feed for pairs
      pairs.forEach(pair => {
        if (!activePriceFeeds[pair]) {
          startPriceFeed(pair, io);
        }
      });

      // Send initial prices
      for (const pair of pairs) {
        const price = await marketService.getCurrentPrice(pair);
        socket.emit('price_update', { pair, price });
      }
    } catch (error) {
      logger.error('Subscribe prices error:', error.message);
      socket.emit('error', { message: 'Failed to subscribe to prices' });
    }
  });

  // Unsubscribe from prices
  socket.on('unsubscribe_prices', (data) => {
    const { pairs } = data;
    pairs.forEach(pair => {
      socket.leave(`price:${pair}`);
    });
    logger.info(`Unsubscribed from: ${pairs.join(', ')}`);
  });

  // Request AI signal
  socket.on('request_signal', async (data) => {
    try {
      const { pair, userId } = data;

      const user = await User.findById(userId);
      const candles = await marketService.getHistoricalData(pair, '1h', 100);
      const recommendation = await aiService.getRecommendations(pair, candles, {
        riskPercentage: user.riskPercentage,
        accountBalance: user.accountBalance
      });

      socket.emit('signal_response', {
        pair,
        signal: recommendation,
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Request signal error:', error.message);
      socket.emit('error', { message: 'Failed to generate signal' });
    }
  });

  // Request portfolio analysis
  socket.on('request_portfolio_analysis', async (data) => {
    try {
      const { userId } = data;

      const analysis = await tradingService.getPortfolioAnalysis(userId);

      socket.emit('portfolio_analysis', {
        analysis,
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Portfolio analysis error:', error.message);
      socket.emit('error', { message: 'Failed to analyze portfolio' });
    }
  });

  // Get trading metrics
  socket.on('request_metrics', async (data) => {
    try {
      const { userId } = data;

      const metrics = await tradingService.getTradingMetrics(userId);

      socket.emit('metrics_response', {
        metrics,
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Get metrics error:', error.message);
      socket.emit('error', { message: 'Failed to fetch metrics' });
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
};

// Start price feed for a pair
function startPriceFeed(pair, io) {
  activePriceFeeds[pair] = setInterval(async () => {
    try {
      const price = await marketService.getCurrentPrice(pair);
      io.emit('price_update', { pair, price, timestamp: new Date() });
    } catch (error) {
      logger.error(`Price feed error for ${pair}:`, error.message);
    }
  }, 2000); // Update every 2 seconds

  logger.info(`Price feed started for ${pair}`);
}

module.exports = { socketHandler };
