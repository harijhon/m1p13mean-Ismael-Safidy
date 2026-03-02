import express from 'express';
import { getStores, getStoreById, createStore, updateStore, deleteStore, getMyStores, updateMyStore } from '../controllers/store.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';

const router = express.Router();

// Route for a manager/admin to create their own store
router.post('/', [verifyToken, authorize(['admin', 'manager'])], createStore);

// Route for manager/admin to get and update THEIR OWN store
router.get('/my-stores', [verifyToken, authorize(['admin', 'manager'])], getMyStores);
router.put('/my-store', [verifyToken, authorize(['admin', 'manager'])], updateMyStore);

// Public route to get all stores
router.get('/', getStores);
router.get('/:id', [verifyToken, authorize(['admin'])], getStoreById);
router.put('/:id', [verifyToken, authorize(['admin'])], updateStore);
router.delete('/:id', [verifyToken, authorize(['admin'])], deleteStore);

export default router;
