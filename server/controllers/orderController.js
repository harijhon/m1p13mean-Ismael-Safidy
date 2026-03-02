import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Store from '../models/Store.js';
import Product from '../models/Product.js'; // Import Product model
import MouvementStock from '../models/MouvementStock.js';

// Get all orders
export const getAllOrders = async (req, res) => {
  try {
    const storeId = req.storeContext;
    const filter = storeId ? { store: storeId } : {};
    const orders = await Order.find(filter).populate('customer').populate('products.product');
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

// Get orders for the authenticated user
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: 'items.product',
        model: 'Product',
        select: 'name images' // Select only the fields you need
      });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la récupération de vos commandes.', error: err.message });
  }
};


// Create a new order
export const createOrder = async (req, res) => {
  const { items } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Order must contain at least one item.' });
  }

  // Use a session for transaction-like behavior
  const session = await mongoose.startSession();
  try {
    // session.startTransaction(); // Uncomment if you have a replica set

    // --- Step 1: Verify stock availability first ---
    for (const item of items) {
      const product = await Product.findById(item.product).session(session);
      if (!product) throw new Error(`Product with ID ${item.product} not found.`);

      if (product.hasVariants) {
        let variant = null;
        if (item.variantId) variant = product.variants.id(item.variantId);
        else if (item.variantSku) variant = product.variants.find(v => v.sku === item.variantSku);

        if (!variant) throw new Error(`Variant not found for product ${product.name}.`);
        if (variant.stock < item.quantity) throw new Error(`Not enough stock for ${product.name} - ${variant.sku}.`);
      } else {
        if (product.currentStock < item.quantity) throw new Error(`Not enough stock for ${product.name}.`);
      }
    }

    // --- Step 2: Calculate total and create order ---
    const totalAmount = items.reduce((sum, item) => sum + (item.priceAtMoment * item.quantity), 0);

    // Get store ID from context or body
    let storeId = req.storeContext || req.body.store;
    if (!storeId && items.length > 0) {
      const firstProd = await Product.findById(items[0].product).session(session);
      if (firstProd) storeId = firstProd.store;
    }
    if (!storeId) throw new Error('Store context required.');

    const orderData = {
      items: items,
      totalAmount: totalAmount,
      store: storeId,
      status: 'COMPLETED', // Set to completed since payment is not integrated yet
      ...req.body // Spread to include other fields like customer info if passed
    };

    if (req.user && req.user._id) {
      orderData.customer = req.user._id;
    }

    const order = new Order(orderData);

    const newOrder = await order.save({ session });

    // --- Step 3: Decrement stock and create MouvementStock ---
    for (const item of newOrder.items) {
      const product = await Product.findById(item.product).session(session);

      const lastMouvement = await MouvementStock.findOne({ product_id: product._id }).sort({ date: -1 }).session(session);
      let newReste = 0;

      if (product.hasVariants) {
        let variant = null;
        if (item.variantId) variant = product.variants.id(item.variantId);
        else if (item.variantSku) variant = product.variants.find(v => v.sku === item.variantSku);

        if (variant) variant.stock -= item.quantity;
        newReste = lastMouvement ? lastMouvement.reste - item.quantity : product.currentStock - item.quantity;
      } else {
        product.currentStock -= item.quantity;
        newReste = product.currentStock;
      }

      await product.save({ session });

      // Trigger Stock Log
      const mouvementLog = new MouvementStock({
        product_id: item.product,
        type: 'sortie',
        quantite: item.quantity,
        pu: item.priceAtMoment || (product.price || 0),
        date: new Date(),
        reste: newReste
      });
      await mouvementLog.save({ session });
    }

    // await session.commitTransaction(); // Uncomment if you have a replica set
    res.status(201).json(newOrder);

  } catch (err) {
    // await session.abortTransaction(); // Uncomment if you have a replica set
    res.status(400).json({ message: err.message });
  } finally {
    // session.endSession(); // Uncomment if you have a replica set
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
