import express from 'express';
const router = express.Router();
import * as productController from '../controllers/productController.js';

// Get all products
router.get('/', productController.getAllProducts);

// Get a single product
router.get('/:id', productController.getProductById);

// Create a new product
router.post('/', productController.createProduct);

// Update a product
router.put('/:id', productController.updateProduct);

// Delete a product
router.delete('/:id', productController.deleteProduct);

export default router;
