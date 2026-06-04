# Matrix Fx - AI-Powered Forex Trading App

A full-stack mobile trading application with real-time market data, AI-powered trading signals, and comprehensive portfolio management.

## 🎯 Features

- **AI Trading Signals**: Intelligent buy/sell signals using RSI, MACD, and Bollinger Bands
- **Real-time Market Data**: Live price updates via WebSocket
- **Portfolio Management**: Track trades, profits, and performance metrics
- **Risk Management**: Configurable leverage, stop-loss, and take-profit
- **User Authentication**: Secure JWT-based authentication
- **Mobile-First**: React Native with Expo for iOS and Android

## 📱 Tech Stack

### Frontend
- **React Native** with Expo
- **Redux Toolkit** for state management
- **Socket.io** for real-time communication
- **React Navigation** for routing
- **Axios** for HTTP requests

### Backend
- **Node.js** with Express
- **MongoDB** for data persistence
- **Socket.io** for WebSocket support
- **JWT** for authentication
- **Bcrypt** for password hashing

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+)
- MongoDB
- Expo CLI (`npm install -g expo-cli`)

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure your .env file with API keys and database URL
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Trading
- `GET /api/trades` - Get user trades
- `POST /api/trades` - Create new trade
- `PUT /api/trades/:id` - Update trade
- `DELETE /api/trades/:id` - Close trade

### Market Data
- `GET /api/market/price/:pair` - Get current price
- `GET /api/market/historical/:pair` - Get historical data
- `POST /api/market/signal` - Get AI trading signal

### User
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile
- `GET /api/user/portfolio` - Get portfolio metrics

## 🔗 WebSocket Events

### Client to Server
- `subscribe_prices` - Subscribe to price updates
- `request_signal` - Request AI trading signal
- `request_portfolio_analysis` - Request portfolio analysis
- `execute_trade` - Execute a trade

### Server to Client
- `price_update` - Real-time price update
- `signal_generated` - New AI signal generated
- `trade_executed` - Trade execution confirmation
- `error` - Error notification

## 🏗️ Project Structure

```
Matrix-Fx/
├── backend/
│   ├── src/
│   │   ├── models/          # MongoDB schemas
│   │   ├── routes/          # API routes
│   │   ├── controllers/      # Route controllers
│   │   ├── services/         # Business logic
│   │   ├── middleware/       # Auth & validation
│   │   ├── utils/            # Utilities
│   │   ├── websocket/        # WebSocket handlers
│   │   ├── config/           # Configuration
│   │   └── app.js            # Express setup
│   ├── server.js             # Server entry point
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── screens/          # Screen components
│   │   ├── components/       # Reusable components
│   │   ├── services/         # API & WebSocket
│   │   ├── redux/            # State management
│   │   └── utils/            # Helpers
│   ├── App.js                # Root component
│   ├── app.json              # Expo config
│   ├── package.json
│   └── .env
```

## 🔐 Security

- Passwords hashed with bcrypt
- JWT tokens for authentication
- CORS enabled for specified origins
- Input validation on all endpoints
- Environment variables for sensitive data

## 📊 Database Schema

### User Model
- username, email, password
- accountBalance, leverage, riskPercentage
- preferredPairs, tradingHistory

### Trade Model
- userId, pair, type (BUY/SELL)
- entryPrice, exitPrice, quantity
- stopLoss, takeProfit, status
- profit, profitPercentage
- AI signal strength and indicators

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📝 Environment Variables

See `.env.example` files in both backend and frontend directories.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 👨‍💻 Author

Gravyvogan

## 🙌 Support

For issues and questions, please create a GitHub issue.

---

**Matrix Fx** - Empowering Traders with AI 🤖📈
