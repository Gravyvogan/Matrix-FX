const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    pair: {
      type: String,
      required: true,
      uppercase: true
    },
    type: {
      type: String,
      enum: ['BUY', 'SELL'],
      required: true
    },
    entryPrice: {
      type: Number,
      required: true
    },
    exitPrice: {
      type: Number,
      default: null
    },
    quantity: {
      type: Number,
      required: true
    },
    stopLoss: {
      type: Number,
      default: null
    },
    takeProfit: {
      type: Number,
      default: null
    },
    status: {
      type: String,
      enum: ['OPEN', 'CLOSED', 'PENDING'],
      default: 'OPEN'
    },
    profit: {
      type: Number,
      default: null
    },
    profitPercentage: {
      type: Number,
      default: null
    },
    aiSignalStrength: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.5
    },
    indicators: {
      rsi: Number,
      macd: Number,
      movingAverage: Number,
      bollingerBands: {
        upper: Number,
        lower: Number,
        middle: Number
      }
    },
    entryTime: {
      type: Date,
      default: Date.now
    },
    exitTime: {
      type: Date,
      default: null
    },
    notes: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Calculate profit when exiting trade
tradeSchema.methods.closeTrade = function (exitPrice) {
  this.exitPrice = exitPrice;
  this.exitTime = new Date();
  this.status = 'CLOSED';

  const priceDifference = this.type === 'BUY' 
    ? exitPrice - this.entryPrice 
    : this.entryPrice - exitPrice;

  this.profit = priceDifference * this.quantity;
  this.profitPercentage = (priceDifference / this.entryPrice) * 100;

  return this;
};

module.exports = mongoose.model('Trade', tradeSchema);
