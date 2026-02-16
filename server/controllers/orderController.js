import Order from '../models/Order.js';
import Store from '../models/Store.js';

// Get all orders
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('customer').populate('products.product');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get a single order
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('customer').populate('products.product');
    if (order == null) {
      return res.status(404).json({ message: 'Cannot find order' });
    }
    res.json(order);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// Create a new order
export const createOrder = async (req, res) => {
  const { items } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Order must contain at least one item.' });
  }

  try {
    // Calculate total amount on the backend for security
    const totalAmount = items.reduce((sum, item) => {
      return sum + (item.priceAtMoment * item.quantity);
    }, 0);

    // For this demo, we'll just find the first store to associate the order with.
    // In a real multi-tenant app, this would come from the user's session or the specific store's domain.
    const store = await Store.findOne();
    if (!store) {
      return res.status(500).json({ message: 'Cannot create order: No store found.' });
    }

    const order = new Order({
      customer: req.user._id, // User ID from verifyToken middleware
      items: items,
      totalAmount: totalAmount,
      store: store._id,
      status: 'PENDING', // Default status
    });

    const newOrder = await order.save();
    res.status(201).json(newOrder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update an order
export const updateOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order == null) {
      return res.status(404).json({ message: 'Cannot find order' });
    }

    if (req.body.customer != null) {
      order.customer = req.body.customer;
    }
    if (req.body.products != null) {
      order.products = req.body.products;
    }
    if (req.body.total != null) {
      order.total = req.body.total;
    }
    if (req.body.status != null) {
      order.status = req.body.status;
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete an order
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order == null) {
      return res.status(404).json({ message: 'Cannot find order' });
    }

    await order.deleteOne();
    res.json({ message: 'Deleted order' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
