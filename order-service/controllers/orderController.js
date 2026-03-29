const Order = require('../models/Order');
const axios = require('axios');

// Create Order
exports.createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, totalAmount } = req.body;

    // Validation
    if (!items || items.length === 0 || !shippingAddress || !totalAmount) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const order = new Order({
      userId: req.userId,
      items,
      shippingAddress,
      totalAmount,
    });

    await order.save();

    // Clear cart after order creation
    try {
      await axios.delete(`${process.env.CART_SERVICE_URL}/api/cart/clear`, {
        headers: {
          Authorization: `Bearer ${req.header('Authorization')?.replace('Bearer ', '')}`,
        },
      });
    } catch (cartError) {
      console.log('Warning: Could not clear cart:', cartError.message);
    }

    res.status(201).json({ message: 'Order created successfully', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get User Orders
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.userId });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check authorization
    if (order.userId !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to access this order' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cancel User Order (Owner only)
exports.cancelUserOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.userId !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to cancel this order' });
    }

    if (order.status === 'cancelled') {
      return res.status(400).json({ message: 'Order is already cancelled' });
    }

    if (order.status === 'shipped' || order.status === 'delivered') {
      return res.status(400).json({ message: 'Shipped or delivered orders cannot be cancelled' });
    }

    if (order.paymentStatus === 'completed') {
      return res.status(400).json({ message: 'Paid orders cannot be cancelled from user flow' });
    }

    order.status = 'cancelled';
    await order.save();

    res.json({ message: 'Order cancelled successfully', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update User Order (Owner only)
exports.updateUserOrder = async (req, res) => {
  try {
    const { shippingAddress } = req.body;

    if (!shippingAddress || !String(shippingAddress).trim()) {
      return res.status(400).json({ message: 'Shipping address is required' });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.userId !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to update this order' });
    }

    if (order.status === 'cancelled' || order.status === 'shipped' || order.status === 'delivered') {
      return res.status(400).json({ message: 'This order can no longer be updated' });
    }

    order.shippingAddress = String(shippingAddress).trim();
    await order.save();

    res.json({ message: 'Order updated successfully', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Order Status (Admin only)
exports.updateOrderStatus = async (req, res) => {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ message: 'Order status updated', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Payment Status (Called by Payment Service)
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { orderId, paymentStatus } = req.body;

    const order = await Order.findByIdAndUpdate(
      orderId,
      { paymentStatus },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ message: 'Payment status updated', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Orders (Admin)
exports.getAllOrders = async (req, res) => {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const orders = await Order.find();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Order (Admin only)
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (req.userRole !== 'admin') {
      if (order.userId !== req.userId) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      if (order.status === 'delivered') {
        return res.status(400).json({ message: 'Delivered orders cannot be deleted' });
      }
    }

    await Order.findByIdAndDelete(req.params.id);

    res.json({ message: 'Order deleted successfully', orderId: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
