const Payment = require('../models/Payment');
const axios = require('axios');

// Initiate Payment
exports.initiatePayment = async (req, res) => {
  try {
    const { orderId, amount, method } = req.body;

    // Validation
    if (!orderId || !amount) {
      return res.status(400).json({ message: 'Please provide orderId and amount' });
    }

    // Check if payment already exists
    const existingPayment = await Payment.findOne({ orderId });
    if (existingPayment) {
      return res.status(400).json({ message: 'Payment already initiated for this order' });
    }

    const payment = new Payment({
      orderId,
      userId: req.userId,
      amount,
      method: method || 'credit_card',
      status: 'pending',
    });

    await payment.save();
    res.status(201).json({ message: 'Payment initiated', payment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Confirm Payment (Mock - simulates successful payment)
exports.confirmPayment = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: 'Please provide orderId' });
    }

    const payment = await Payment.findOne({ orderId });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Mock transaction ID generation
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Update payment status
    payment.status = 'completed';
    payment.transactionId = transactionId;
    await payment.save();

    // Notify Order Service about payment completion
    try {
      await axios.put(`${process.env.ORDER_SERVICE_URL}/api/orders/payment-status/update`, {
        orderId,
        paymentStatus: 'completed',
      });
    } catch (orderError) {
      console.log('Warning: Could not update order payment status:', orderError.message);
    }

    res.json({ message: 'Payment confirmed successfully', payment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Payment by Order ID
exports.getPaymentByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;

    const payment = await Payment.findOne({ orderId });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get User Payments
exports.getUserPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.userId });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Failed Payment
exports.failPayment = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: 'Please provide orderId' });
    }

    const payment = await Payment.findOne({ orderId });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    payment.status = 'failed';
    await payment.save();

    // Notify Order Service
    try {
      await axios.put(`${process.env.ORDER_SERVICE_URL}/api/orders/payment-status/update`, {
        orderId,
        paymentStatus: 'failed',
      });
    } catch (orderError) {
      console.log('Warning: Could not update order payment status:', orderError.message);
    }

    res.json({ message: 'Payment marked as failed', payment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
