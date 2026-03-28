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
  .then(() => console.log('Cart Service: MongoDB connected'))
  .catch(err => console.error('Cart Service: MongoDB connection error:', err));

// Routes
app.use('/api/cart', require('./routes/cartRoutes'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Cart Service is running' });
});

const PORT = process.env.PORT || 5003;
app.listen(PORT, () => {
  console.log(`Cart Service running on port ${PORT}`);
});

module.exports = app;
