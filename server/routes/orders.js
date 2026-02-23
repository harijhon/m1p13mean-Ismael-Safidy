import express from 'express';
const router = express.Router();
import * as orderController from '../controllers/orderController.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { requireStoreContext, optionalStoreContext } from '../middlewares/store-context.middleware.js';

// Get all orders (Admin/Manager dashboard view)
router.get('/', [verifyToken, requireStoreContext], orderController.getAllOrders);

// Get orders for the authenticated user
router.get('/my-orders', [verifyToken, optionalStoreContext], orderController.getMyOrders);

// Get a single order
router.get('/:id', [verifyToken], orderController.getOrderById);

// Create a new order
router.post('/', optionalStoreContext, orderController.createOrder);

// Update an order
router.put('/:id', orderController.updateOrder);

// Delete an order
router.delete('/:id', orderController.deleteOrder);

export default router;
