const express = require('express');
const session = require('express-session');
const helmet = require('helmet');
const path = require('path');
const config = require('./config/config');
const { initDatabase } = require('./db/database');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimiter');

// Routes
const authRoutes = require('./routes/auth');
const recipeRoutes = require('./routes/recipes');
const ratingRoutes = require('./routes/ratings');
const userRoutes = require('./routes/users');

const app = express();

// Security headers
app.use(helmet({
  contentSecurityPolicy: false // Allow inline scripts in our HTML pages
}));

// Trust proxy (for Railway / reverse proxy)
if (config.env === 'production') {
  app.set('trust proxy', 1);
}

// Body parsing with size limits
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Rate limiting
app.use(generalLimiter);

// Session
app.use(session({
  secret: config.session.secret || 'dev-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: config.session.maxAge,
    httpOnly: true,
    secure: config.env === 'production',
    sameSite: 'lax'
  }
}));

// Serve static frontend files with caching
app.use(express.static(path.join(__dirname, '..', 'frontend'), {
  maxAge: config.env === 'production' ? '7d' : 0,
  etag: true
}));

// Health check (public, no auth required)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/users', userRoutes);

// Serve HTML pages
const frontendPages = path.join(__dirname, '..', 'frontend');

app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPages, 'index.html'));
});

const pageRoutes = ['login', 'signup', 'home', 'recipe', 'saved', 'inspiration', 'profile', 'settings'];
pageRoutes.forEach(page => {
  app.get(`/${page}`, (req, res) => {
    res.sendFile(path.join(frontendPages, 'pages', `${page}.html`));
  });
});

// Error handling
app.use('/api/*', notFoundHandler);
app.use(errorHandler);

// Start server
async function start() {
  try {
    await initDatabase();

    app.listen(config.port, () => {
      console.log(`Chef July server running on port ${config.port}`);
      console.log(`Environment: ${config.env}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
