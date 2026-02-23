import express from 'express';
import { generateInvoices, recordPayment, getInvoices, getRentStats } from '../controllers/rent.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';

const router = express.Router();

// All rent routes are protected and strictly for Admins
router.use(verifyToken, authorize(['admin']));

router.post('/generate', generateInvoices);
router.post('/payment', recordPayment);
router.get('/stats', getRentStats);
router.get('/', getInvoices);

export default router;
