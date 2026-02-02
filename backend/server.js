const express = require('express');
const session = require('express-session');
const path = require('path');
const config = require('./config/config');
const { initDatabase } = require('./db/database');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimiter');

// Routes
const authRoutes = require('./routes/auth');
const recipeRoutes = require('./routes/recipes');
const ratingRoutes = require('./routes/ratings');

const app = express();

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Serve static frontend files
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/ratings', ratingRoutes);

// Serve HTML pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'pages', 'login.html'));
});

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'pages', 'signup.html'));
});

app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'pages', 'home.html'));
});

app.get('/recipe', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'pages', 'recipe.html'));
});

app.get('/saved', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'pages', 'saved.html'));
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
