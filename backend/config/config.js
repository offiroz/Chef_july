require('dotenv').config();

const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  host: process.env.HOST || 'localhost',

  database: {
    path: process.env.DATABASE_PATH || './data/chef_july.db',
    url: process.env.DATABASE_URL
  },

  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
  },

  session: {
    secret: process.env.SESSION_SECRET,
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  },

  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 10
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
  }
};

// Validate required env vars only in production or when actually needed
const requiredEnvVars = ['SESSION_SECRET'];
requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    console.warn(`Warning: Missing environment variable: ${varName}`);
  }
});

module.exports = config;
