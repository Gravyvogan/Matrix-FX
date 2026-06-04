const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

const colors = {
  error: '\x1b[31m',   // Red
  warn: '\x1b[33m',    // Yellow
  info: '\x1b[36m',    // Cyan
  debug: '\x1b[35m',   // Magenta
  reset: '\x1b[0m'
};

const logger = {
  error: (message, error = '') => {
    if (levels[LOG_LEVEL] >= levels.error) {
      console.error(
        `${colors.error}[ERROR]${colors.reset} ${new Date().toISOString()} - ${message}`,
        error
      );
    }
  },
  warn: (message) => {
    if (levels[LOG_LEVEL] >= levels.warn) {
      console.warn(
        `${colors.warn}[WARN]${colors.reset} ${new Date().toISOString()} - ${message}`
      );
    }
  },
  info: (message) => {
    if (levels[LOG_LEVEL] >= levels.info) {
      console.log(
        `${colors.info}[INFO]${colors.reset} ${new Date().toISOString()} - ${message}`
      );
    }
  },
  debug: (message, data = '') => {
    if (levels[LOG_LEVEL] >= levels.debug) {
      console.log(
        `${colors.debug}[DEBUG]${colors.reset} ${new Date().toISOString()} - ${message}`,
        data
      );
    }
  }
};

module.exports = logger;
