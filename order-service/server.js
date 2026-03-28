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
  .then(() => console.log('Order Service: MongoDB connected'))
  .catch(err => console.error('Order Service: MongoDB connection error:', err));

// Routes
app.use('/api/orders', require('./routes/orderRoutes'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Order Service is running' });
});

const PORT = process.env.PORT || 5004;
app.listen(PORT, () => {
  console.log(`Order Service running on port ${PORT}`);
});

module.exports = app;
