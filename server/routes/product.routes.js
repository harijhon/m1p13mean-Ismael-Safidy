import express from 'express';
import { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct } from '../controllers/product.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';

const router = express.Router();

// Public routes for viewing products
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Protected routes for managing products (Admin or Manager)
router.post('/', [verifyToken, authorize(['admin', 'manager'])], createProduct);
router.put('/:id', [verifyToken, authorize(['admin', 'manager'])], updateProduct);
router.delete('/:id', [verifyToken, authorize(['admin', 'manager'])], deleteProduct);

export default router;