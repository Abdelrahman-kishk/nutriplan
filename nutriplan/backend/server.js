require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');

const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const profileRoutes = require('./routes/profile');
const recipeRoutes = require('./routes/recipes');
const categoryRoutes = require('./routes/categories');
const foodLogRoutes = require('./routes/foodLog');

const app = express();

// --- Database ---
connectDB();

// --- Core middleware ---
app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());

const allowedOrigins = (process.env.CLIENT_ORIGIN || '*')
  .split(',')
  .map((o) => o.trim());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// Basic rate limiting on API routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', apiLimiter);

// --- Health check ---
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'NutriPlan API is healthy', time: new Date().toISOString() });
});

// --- Routes ---
app.use('/api/profile', profileRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/food-log', foodLogRoutes);

// --- 404 + error handling ---
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[Server] NutriPlan API running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

module.exports = app;
