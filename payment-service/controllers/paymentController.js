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

    // Fetch order details so payment has the exact purchased items
    let orderItems = [];
    try {
      const authHeader = req.header('Authorization');
      const orderResponse = await axios.get(`${process.env.ORDER_SERVICE_URL}/api/orders/${orderId}`, {
        headers: {
          Authorization: authHeader,
        },
      });
      orderItems = Array.isArray(orderResponse.data?.items) ? orderResponse.data.items : [];
    } catch (orderError) {
      return res.status(400).json({ message: `Could not fetch order details: ${orderError.message}` });
    }

    if (orderItems.length === 0) {
      return res.status(400).json({ message: 'Cannot initiate payment for an order with no items' });
    }

    const payment = new Payment({
      orderId,
      userId: req.userId,
      amount,
      items: orderItems,
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

    // Prevent duplicate stock reduction on repeated confirmation calls
    if (payment.status === 'completed') {
      return res.json({ message: 'Payment already confirmed', payment });
    }

    if (!Array.isArray(payment.items) || payment.items.length === 0) {
      return res.status(400).json({ message: 'Payment has no order items for stock reduction' });
    }

    // Mock transaction ID generation
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Reduce stock in Product Service once payment succeeds
    try {
      await axios.post(`${process.env.PRODUCT_SERVICE_URL}/api/products/stock/reduce`, {
        items: payment.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      });
    } catch (productError) {
      return res.status(400).json({
        message: `Payment could not be confirmed because stock update failed: ${productError.response?.data?.message || productError.message}`,
      });
    }

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
