const Payment = require('../models/Payment');
const axios = require('axios');

function isFutureOrCurrentExpiry(expiry) {
  const match = /^(0[1-9]|1[0-2])\/([0-9]{2})$/.exec(expiry);
  if (!match) return false;

  const expiryMonth = Number(match[1]);
  const expiryYear = 2000 + Number(match[2]);

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  if (expiryYear < currentYear) return false;
  if (expiryYear === currentYear && expiryMonth < currentMonth) return false;
  return true;
}

// Initiate Payment
exports.initiatePayment = async (req, res) => {
  try {
    const { orderId, amount, method, cardDetails } = req.body;

    // Validation
    if (!orderId || !amount) {
      return res.status(400).json({ message: 'Please provide orderId and amount' });
    }

    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({ message: 'Amount must be a positive number' });
    }

    const paymentMethod = method || 'credit_card';
    const allowedMethods = ['credit_card', 'debit_card', 'online_banking', 'cash_on_delivery'];

    if (!allowedMethods.includes(paymentMethod)) {
      return res.status(400).json({ message: 'Invalid payment method' });
    }

    const requiresCardDetails = ['credit_card', 'debit_card'].includes(paymentMethod);

    if (requiresCardDetails) {
      const cardNumber = String(cardDetails?.cardNumber || '').replace(/\s+/g, '');
      const expiry = String(cardDetails?.expiry || '');
      const cvv = String(cardDetails?.cvv || '');
      const cardHolderName = String(cardDetails?.cardHolderName || '').trim();

      if (!cardHolderName) {
        return res.status(400).json({ message: 'Card holder name is required' });
      }

      if (!/^[0-9]{16}$/.test(cardNumber)) {
        return res.status(400).json({ message: 'Card number must be 16 digits' });
      }

      if (!/^(0[1-9]|1[0-2])\/[0-9]{2}$/.test(expiry)) {
        return res.status(400).json({ message: 'Expiry must be in MM/YY format' });
      }

      if (!isFutureOrCurrentExpiry(expiry)) {
        return res.status(400).json({ message: 'Card is expired' });
      }

      if (!/^[0-9]{3,4}$/.test(cvv)) {
        return res.status(400).json({ message: 'CVV must be 3 or 4 digits' });
      }
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
      method: paymentMethod,
      cardHolderName: requiresCardDetails ? String(cardDetails?.cardHolderName || '').trim() : '',
      cardLast4: requiresCardDetails ? String(cardDetails?.cardNumber || '').replace(/\s+/g, '').slice(-4) : '',
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
