import io from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

class WebSocketService {
  constructor() {
    this.socket = null;
  }

  connect(token) {
    this.socket = io(SOCKET_URL, {
      auth: {
        token,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  subscribe(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  unsubscribe(event) {
    if (this.socket) {
      this.socket.off(event);
    }
  }

  emit(event, data) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  subscribePrices(pairs, userId) {
    this.emit('subscribe_prices', { pairs, userId });
  }

  requestSignal(pair, userId) {
    this.emit('request_signal', { pair, userId });
  }

  requestPortfolioAnalysis(userId) {
    this.emit('request_portfolio_analysis', { userId });
  }

  requestMetrics(userId) {
    this.emit('request_metrics', { userId });
  }
}

export default new WebSocketService();
