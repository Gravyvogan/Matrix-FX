const marketService = require('./marketService');
const logger = require('../utils/logger');

const aiService = {
  // Generate trading signals based on technical analysis
  generateSignal: async (pair, candles) => {
    try {
      // Calculate indicators
      const indicators = await marketService.calculateIndicators(candles);

      // Analyze indicators
      const analysis = analyzeIndicators(indicators);

      // Generate signal with strength
      const signal = generateTradingSignal(analysis, indicators);

      logger.debug(`Signal generated for ${pair}:`, signal);

      return signal;
    } catch (error) {
      logger.error('AI signal generation error:', error.message);
      throw error;
    }
  },

  // Evaluate trade risk
  evaluateRisk: (entryPrice, stopLoss, riskPercentage, accountBalance) => {
    try {
      const riskAmount = accountBalance * riskPercentage;
      const priceDifference = Math.abs(entryPrice - stopLoss);
      const quantity = riskAmount / priceDifference;

      return {
        riskAmount,
        suggestedQuantity: Math.floor(quantity),
        riskRewardRatio: calculateRiskRewardRatio(entryPrice, stopLoss, stopLoss * 2)
      };
    } catch (error) {
      logger.error('Risk evaluation error:', error.message);
      throw error;
    }
  },

  // Get AI recommendations
  getRecommendations: async (pair, candles, userProfile) => {
    try {
      const signal = await aiService.generateSignal(pair, candles);
      const indicators = await marketService.calculateIndicators(candles);

      if (signal.strength < 0.5) {
        return {
          recommendation: 'HOLD',
          reason: 'Signal strength too low',
          confidence: signal.strength,
          actions: []
        };
      }

      const lastCandle = candles[candles.length - 1];
      const stopLoss = signal.type === 'BUY'
        ? lastCandle.low - (lastCandle.close - lastCandle.low)
        : lastCandle.high + (lastCandle.high - lastCandle.close);

      const takeProfit = signal.type === 'BUY'
        ? lastCandle.close + (lastCandle.close - stopLoss) * 2
        : lastCandle.close - (stopLoss - lastCandle.close) * 2;

      const riskAnalysis = aiService.evaluateRisk(
        lastCandle.close,
        stopLoss,
        userProfile.riskPercentage,
        userProfile.accountBalance
      );

      return {
        recommendation: signal.type,
        strength: signal.strength,
        confidence: signal.strength,
        entryPrice: parseFloat(lastCandle.close.toFixed(5)),
        stopLoss: parseFloat(stopLoss.toFixed(5)),
        takeProfit: parseFloat(takeProfit.toFixed(5)),
        suggestedQuantity: riskAnalysis.suggestedQuantity,
        riskRewardRatio: riskAnalysis.riskRewardRatio,
        indicators: {
          rsi: indicators.rsi,
          macd: indicators.macd,
          bollinger: indicators.bollinger
        },
        reason: signal.reason,
        timestamp: new Date()
      };
    } catch (error) {
      logger.error('Get recommendations error:', error.message);
      throw error;
    }
  }
};

// Analyze indicators and return scores
function analyzeIndicators(indicators) {
  const scores = {
    rsi: analyzeRSI(indicators.rsi),
    macd: analyzeMACD(indicators.macd),
    bollinger: analyzeBollinger(indicators.bollinger)
  };

  return scores;
}

// Analyze RSI (14 period)
function analyzeRSI(rsi) {
  // RSI > 70: Overbought (sell signal)
  // RSI < 30: Oversold (buy signal)
  if (rsi > 70) return { signal: 'SELL', strength: (rsi - 70) / 30 };
  if (rsi < 30) return { signal: 'BUY', strength: (30 - rsi) / 30 };
  return { signal: 'NEUTRAL', strength: 0.3 };
}

// Analyze MACD
function analyzeMACD(macd) {
  // MACD > Signal: Buy signal
  // MACD < Signal: Sell signal
  if (macd.macd > macd.signal) {
    return { signal: 'BUY', strength: Math.min(macd.histogram / 0.01, 1) };
  }
  return { signal: 'SELL', strength: Math.min(Math.abs(macd.histogram) / 0.01, 1) };
}

// Analyze Bollinger Bands
function analyzeBollinger(bollinger) {
  // Price at upper band: likely sell
  // Price at lower band: likely buy
  // For simplicity, compare to middle
  const midPrice = bollinger.middle;
  if (midPrice > bollinger.middle) {
    return { signal: 'SELL', strength: 0.4 };
  }
  return { signal: 'BUY', strength: 0.4 };
}

// Generate final trading signal
function generateTradingSignal(analysis, indicators) {
  const rsiSignal = analysis.rsi.signal;
  const macdSignal = analysis.macd.signal;
  const bollingerSignal = analysis.bollinger.signal;

  // Count signals
  const buySignals = [rsiSignal, macdSignal, bollingerSignal].filter(s => s === 'BUY').length;
  const sellSignals = [rsiSignal, macdSignal, bollingerSignal].filter(s => s === 'SELL').length;

  let type = 'HOLD';
  let reason = 'Mixed signals';
  let strength = 0.5;

  if (buySignals > sellSignals) {
    type = 'BUY';
    reason = `Buy signals: RSI ${rsiSignal}, MACD ${macdSignal}`;
    strength = (buySignals / 3) * (0.3 + analysis.rsi.strength * 0.3 + analysis.macd.strength * 0.4);
  } else if (sellSignals > buySignals) {
    type = 'SELL';
    reason = `Sell signals: RSI ${rsiSignal}, MACD ${macdSignal}`;
    strength = (sellSignals / 3) * (0.3 + analysis.rsi.strength * 0.3 + analysis.macd.strength * 0.4);
  }

  return {
    type,
    reason,
    strength: Math.min(Math.max(strength, 0), 1) // Clamp between 0 and 1
  };
}

// Calculate risk-reward ratio
function calculateRiskRewardRatio(entry, stopLoss, takeProfit) {
  const risk = Math.abs(entry - stopLoss);
  const reward = Math.abs(takeProfit - entry);
  return (reward / risk).toFixed(2);
}

module.exports = aiService;
