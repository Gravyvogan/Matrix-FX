# Matrix Fx - AI-Powered Forex Trading App

A cross-platform mobile application combining real-time forex market data, WebSocket communication, and AI-driven trading signals.

## 🚀 Features

- **Real-time Market Data**: Live forex prices via WebSocket
- **Trading AI Engine**: Intelligent trading signals based on technical analysis
- **User Authentication**: Secure JWT-based login system
- **Live Charts**: Real-time price visualization
- **Trading Dashboard**: Monitor positions and signals
- **Cross-Platform**: iOS and Android support via React Native

## 📁 Project Structure

```
Matrix-Fx/
├── backend/              # Node.js/Express backend
│   ├── src/
│   │   ├── models/       # Database models
│   │   ├── routes/       # API endpoints
│   │   ├── controllers/  # Business logic
│   │   ├── middleware/   # Auth, validation
│   │   ├── services/     # AI, market data, trading
│   │   ├── websocket/    # WebSocket handlers
│   │   └── app.js        # Express app
│   ├── .env.example      # Environment variables template
│   ├── package.json      # Dependencies
│   └── server.js         # Server entry point
│
└── frontend/             # React Native app
    ├── src/
    │   ├── screens/      # Screen components
    │   ├── components/   # Reusable components
    │   ├── services/     # API & WebSocket client
    │   ├── redux/        # State management
    │   ├── utils/        # Helper functions
    │   └── App.js        # Main app component
    ├── app.json          # Expo/RN config
    └── package.json      # Dependencies
```

## 🛠️ Tech Stack

### Backend
- **Node.js** & **Express** - Server framework
- **MongoDB** - Database
- **Socket.io** - Real-time WebSocket communication
- **JWT** - Authentication
- **Axios** - HTTP client for market data APIs

### Frontend
- **React Native** - Cross-platform mobile
- **Expo** - Development environment
- **Redux** - State management
- **Socket.io-client** - WebSocket client
- **React Navigation** - Navigation

## 🔧 Setup Instructions

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure your .env file with API keys and database
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## 🤖 AI Trading Engine

The AI uses technical analysis indicators:
- Moving Averages (MA)
- Relative Strength Index (RSI)
- MACD
- Bollinger Bands
- Support/Resistance levels

## 🔐 Security

- JWT token-based authentication
- Password hashing with bcrypt
- Environment variables for sensitive data
- HTTPS ready

## 📝 License

MIT

## 👤 Author

Gravyvogan

---

**Status**: 🚧 In Development
