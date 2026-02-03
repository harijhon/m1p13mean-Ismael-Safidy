import express from 'express';
const router = express.Router();
import * as orderController from '../controllers/orderController.js';

// Get all orders
router.get('/', orderController.getAllOrders);

// Get a single order
router.get('/:id', orderController.getOrderById);

// Create a new order
router.post('/', orderController.createOrder);

// Update an order
router.put('/:id', orderController.updateOrder);

// Delete an order
router.delete('/:id', orderController.deleteOrder);

export default router;
