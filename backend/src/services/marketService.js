const axios = require('axios');
const logger = require('../utils/logger');

// Mock data for development - Replace with real API calls
const mockPrices = {
  'EUR/USD': 1.0850,
  'GBP/USD': 1.2650,
  'USD/JPY': 110.50,
  'USD/CHF': 0.9280,
  'AUD/USD': 0.6750,
  'USD/CAD': 1.2450,
  'NZD/USD': 0.6150,
  'EUR/GBP': 0.8580,
  'EUR/JPY': 119.80,
  'GBP/JPY': 139.20
};

const marketService = {
  // Get current price for a pair
  getCurrentPrice: async (pair) => {
    try {
      const normalizedPair = pair.toUpperCase();
      
      // For now, return mock data with slight variation
      const basePrice = mockPrices[normalizedPair] || 1.0;
      const variation = (Math.random() - 0.5) * 0.001;
      
      return (basePrice + variation).toFixed(5);

      // In production, use:
      // return await fetchFromAlphaVantage(pair);
      // or await fetchFromFXPro(pair);
    } catch (error) {
      logger.error('Market service error:', error.message);
      throw error;
    }
  },

  // Get historical data
  getHistoricalData: async (pair, timeframe = '1h', limit = 100) => {
    try {
      const candles = [];
      const basePrice = mockPrices[pair.toUpperCase()] || 1.0;

      // Generate mock historical data
      for (let i = limit - 1; i >= 0; i--) {
        const timestamp = new Date(Date.now() - i * 3600000); // 1 hour intervals
        const open = basePrice + (Math.random() - 0.5) * 0.01;
        const close = open + (Math.random() - 0.5) * 0.005;
        const high = Math.max(open, close) + Math.abs(Math.random() * 0.003);
        const low = Math.min(open, close) - Math.abs(Math.random() * 0.003);
        const volume = Math.floor(Math.random() * 1000000);

        candles.push({
          timestamp,
          open: parseFloat(open.toFixed(5)),
          close: parseFloat(close.toFixed(5)),
          high: parseFloat(high.toFixed(5)),
          low: parseFloat(low.toFixed(5)),
          volume
        });
      }

      return candles;
    } catch (error) {
      logger.error('Get historical data error:', error.message);
      throw error;
    }
  },

  // Calculate technical indicators
  calculateIndicators: async (candles) => {
    try {
      const closes = candles.map(c => c.close);
      const period = 14;

      // Simple Moving Average (SMA)
      const sma = closes.slice(-period).reduce((a, b) => a + b, 0) / period;

      // Relative Strength Index (RSI)
      const rsi = calculateRSI(closes, period);

      // MACD
      const macd = calculateMACD(closes);

      // Bollinger Bands
      const bollinger = calculateBollingerBands(closes, period);

      return {
        sma,
        rsi,
        macd,
        bollinger
      };
    } catch (error) {
      logger.error('Calculate indicators error:', error.message);
      throw error;
    }
  }
};

// Helper function: Calculate RSI
function calculateRSI(closes, period = 14) {
  const changes = [];
  for (let i = 1; i < closes.length; i++) {
    changes.push(closes[i] - closes[i - 1]);
  }

  const gains = changes.filter(c => c > 0).reduce((a, b) => a + b, 0) / period;
  const losses = -changes.filter(c => c < 0).reduce((a, b) => a + b, 0) / period;

  const rs = gains / losses;
  const rsi = 100 - (100 / (1 + rs));

  return parseFloat(rsi.toFixed(2));
}

// Helper function: Calculate MACD
function calculateMACD(closes) {
  const ema12 = calculateEMA(closes, 12);
  const ema26 = calculateEMA(closes, 26);
  const macd = ema12 - ema26;
  const signal = calculateEMA([macd], 9);

  return {
    macd: parseFloat(macd.toFixed(5)),
    signal: parseFloat(signal.toFixed(5)),
    histogram: parseFloat((macd - signal).toFixed(5))
  };
}

// Helper function: Calculate EMA
function calculateEMA(data, period) {
  const k = 2 / (period + 1);
  let ema = data[0];

  for (let i = 1; i < data.length; i++) {
    ema = data[i] * k + ema * (1 - k);
  }

  return ema;
}

// Helper function: Calculate Bollinger Bands
function calculateBollingerBands(closes, period = 20) {
  const sma = closes.slice(-period).reduce((a, b) => a + b, 0) / period;
  const variance = closes.slice(-period).reduce((sum, val) => sum + Math.pow(val - sma, 2), 0) / period;
  const stdDev = Math.sqrt(variance);

  return {
    upper: parseFloat((sma + stdDev * 2).toFixed(5)),
    middle: parseFloat(sma.toFixed(5)),
    lower: parseFloat((sma - stdDev * 2).toFixed(5))
  };
}

module.exports = marketService;
