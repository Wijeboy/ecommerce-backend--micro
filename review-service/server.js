const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Review Service: MongoDB connected'))
  .catch(err => console.error('Review Service: MongoDB connection error:', err));

// Routes
app.use('/api/reviews', require('./routes/reviewRoutes'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Review Service is running' });
});

const PORT = process.env.PORT || 5006;
app.listen(PORT, () => {
  console.log(`Review Service running on port ${PORT}`);
});

module.exports = app;
