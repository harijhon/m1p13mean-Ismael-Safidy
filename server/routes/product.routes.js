import express from 'express';
import { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct } from '../controllers/product.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';

const router = express.Router();

// Middleware de sécurité appliqué à toutes les routes product
// Seuls les admins peuvent gérer les produits
router.use(verifyToken, authorize(['admin']));

// Routes CRUD
router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;