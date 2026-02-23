import express from 'express';
import { createPromotion, stopPromotion, getPromotionsByStore } from '../controllers/promotion.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';

const router = express.Router();

// Routes for Promotions (Secured by authentication and manager/admin roles)
router.post('/', verifyToken, authorize(['manager', 'admin']), createPromotion);
router.put('/:id/stop', verifyToken, authorize(['manager', 'admin']), stopPromotion);
router.get('/store/:storeId', verifyToken, getPromotionsByStore);

export default router;
