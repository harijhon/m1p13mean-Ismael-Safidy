import express from 'express';
import { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct } from '../controllers/product.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import { requireStoreContext, optionalStoreContext } from '../middlewares/store-context.middleware.js';

const router = express.Router();

// Public routes for viewing products (Optional store filtering)
router.get('/', optionalStoreContext, getAllProducts);
router.get('/:id', getProductById);

// Protected routes for managing products (Admin or Manager) -> Requires explicit store context to create
router.post('/', [verifyToken, authorize(['admin', 'manager']), requireStoreContext], createProduct);
router.put('/:id', [verifyToken, authorize(['admin', 'manager'])], updateProduct);
router.delete('/:id', [verifyToken, authorize(['admin', 'manager'])], deleteProduct);

export default router;