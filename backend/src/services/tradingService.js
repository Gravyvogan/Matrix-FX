const Trade = require('../models/Trade');
const User = require('../models/User');
const aiService = require('./aiService');
const marketService = require('./marketService');
const logger = require('../utils/logger');

const tradingService = {
  // Execute a trade with AI analysis
  executeTrade: async (userId, pair, type, quantity, entryPrice, stopLoss, takeProfit) => {
    try {
      const user = await User.findById(userId);

      if (!user) {
        throw new Error('User not found');
      }

      // Validate sufficient balance
      const requiredBalance = entryPrice * quantity * user.leverage;
      if (user.accountBalance < requiredBalance) {
        throw new Error('Insufficient balance');
      }

      // Create trade
      const trade = new Trade({
        userId,
        pair: pair.toUpperCase(),
        type: type.toUpperCase(),
        quantity,
        entryPrice,
        stopLoss,
        takeProfit,
        status: 'OPEN'
      });

      await trade.save();

      // Add to user's trading history
      user.tradingHistory.push(trade._id);
      await user.save();

      logger.info(`Trade executed: ${trade._id}`);

      return trade;
    } catch (error) {
      logger.error('Execute trade error:', error.message);
      throw error;
    }
  },

  // Check for trade stop-loss/take-profit
  checkTradeClosingConditions: async (trades, currentPrices) => {
    try {
      const closedTrades = [];

      for (const trade of trades) {
        if (trade.status !== 'OPEN') continue;

        const currentPrice = currentPrices[trade.pair];
        if (!currentPrice) continue;

        let shouldClose = false;

        // Check stop loss
        if (trade.type === 'BUY' && currentPrice <= trade.stopLoss) {
          shouldClose = true;
        } else if (trade.type === 'SELL' && currentPrice >= trade.stopLoss) {
          shouldClose = true;
        }

        // Check take profit
        if (trade.type === 'BUY' && currentPrice >= trade.takeProfit) {
          shouldClose = true;
        } else if (trade.type === 'SELL' && currentPrice <= trade.takeProfit) {
          shouldClose = true;
        }

        if (shouldClose) {
          trade.closeTrade(currentPrice);
          await trade.save();

          // Update user balance
          const user = await User.findById(trade.userId);
          user.accountBalance += trade.profit;
          await user.save();

          closedTrades.push(trade);
          logger.info(`Trade auto-closed: ${trade._id}`);
        }
      }

      return closedTrades;
    } catch (error) {
      logger.error('Check closing conditions error:', error.message);
      throw error;
    }
  },

  // Get AI analysis for all user's pairs
  getPortfolioAnalysis: async (userId) => {
    try {
      const user = await User.findById(userId);
      const openTrades = await Trade.find({ userId, status: 'OPEN' });

      const analysis = {};

      for (const pair of user.preferredPairs) {
        try {
          const candles = await marketService.getHistoricalData(pair, '1h', 100);
          const recommendation = await aiService.getRecommendations(pair, candles, {
            riskPercentage: user.riskPercentage,
            accountBalance: user.accountBalance
          });

          analysis[pair] = recommendation;
        } catch (error) {
          logger.warn(`Failed to analyze ${pair}:`, error.message);
          analysis[pair] = { error: 'Failed to analyze' };
        }
      }

      return analysis;
    } catch (error) {
      logger.error('Portfolio analysis error:', error.message);
      throw error;
    }
  },

  // Get trading performance metrics
  getTradingMetrics: async (userId) => {
    try {
      const trades = await Trade.find({ userId, status: 'CLOSED' });

      const metrics = {
        totalTrades: trades.length,
        winningTrades: 0,
        losingTrades: 0,
        totalProfit: 0,
        totalLoss: 0,
        breakEvenTrades: 0,
        winRate: 0,
        profitFactor: 0,
        averageWin: 0,
        averageLoss: 0,
        largestWin: 0,
        largestLoss: 0,
        consecutiveWins: 0,
        consecutiveLosses: 0
      };

      let currentWinStreak = 0;
      let currentLossStreak = 0;

      trades.forEach(trade => {
        if (trade.profit > 0) {
          metrics.winningTrades++;
          metrics.totalProfit += trade.profit;
          metrics.largestWin = Math.max(metrics.largestWin, trade.profit);
          currentWinStreak++;
          currentLossStreak = 0;
        } else if (trade.profit < 0) {
          metrics.losingTrades++;
          metrics.totalLoss += Math.abs(trade.profit);
          metrics.largestLoss = Math.min(metrics.largestLoss, trade.profit);
          currentLossStreak++;
          currentWinStreak = 0;
        } else {
          metrics.breakEvenTrades++;
        }

        metrics.consecutiveWins = Math.max(metrics.consecutiveWins, currentWinStreak);
        metrics.consecutiveLosses = Math.max(metrics.consecutiveLosses, currentLossStreak);
      });

      if (metrics.totalTrades > 0) {
        metrics.winRate = (metrics.winningTrades / metrics.totalTrades) * 100;
        metrics.averageWin = metrics.winningTrades > 0 ? metrics.totalProfit / metrics.winningTrades : 0;
        metrics.averageLoss = metrics.losingTrades > 0 ? metrics.totalLoss / metrics.losingTrades : 0;
        metrics.profitFactor = metrics.totalLoss > 0 ? metrics.totalProfit / metrics.totalLoss : 0;
      }

      return metrics;
    } catch (error) {
      logger.error('Get metrics error:', error.message);
      throw error;
    }
  }
};

module.exports = tradingService;
