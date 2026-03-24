require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS configuration
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (server-to-server, mobile apps)
    if (!origin) return callback(null, true);
    if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: false
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100
});
app.use('/api/', limiter);

app.use(express.json());

// Routes
app.use('/api/availability', require('./routes/availability'));
app.use('/api/rates', require('./routes/rates'));
app.use('/api/booking', require('./routes/booking'));
app.use('/api/maps', require('./routes/maps'));
app.use('/widget', require('./routes/widget'));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    property: process.env.EXELY_PROPERTY_ID || 'not configured'
  });
});

// Root
app.get('/', (req, res) => {
  res.json({ name: '1883 Chatbot API', version: '1.0.0' });
});

app.listen(PORT, () => {
  console.log(`1883 Chatbot API running on port ${PORT}`);
});

module.exports = app;