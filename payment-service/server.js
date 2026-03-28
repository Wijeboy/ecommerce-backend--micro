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
  .then(() => console.log('Payment Service: MongoDB connected'))
  .catch(err => console.error('Payment Service: MongoDB connection error:', err));

// Routes
app.use('/api/payments', require('./routes/paymentRoutes'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Payment Service is running' });
});

const PORT = process.env.PORT || 5005;
app.listen(PORT, () => {
  console.log(`Payment Service running on port ${PORT}`);
});

module.exports = app;
