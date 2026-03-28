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
  .then(() => console.log('Product Service: MongoDB connected'))
  .catch(err => console.error('Product Service: MongoDB connection error:', err));

// Routes
app.use('/api/products', require('./routes/productRoutes'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Product Service is running' });
});

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`Product Service running on port ${PORT}`);
});

module.exports = app;
