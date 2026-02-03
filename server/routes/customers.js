import express from 'express';
const router = express.Router();
import * as customerController from '../controllers/customerController.js';

// Get all customers
router.get('/', customerController.getAllCustomers);

// Get a single customer
router.get('/:id', customerController.getCustomerById);

// Create a new customer
router.post('/', customerController.createCustomer);

// Update a customer
router.put('/:id', customerController.updateCustomer);

// Delete a customer
router.delete('/:id', customerController.deleteCustomer);

export default router;
