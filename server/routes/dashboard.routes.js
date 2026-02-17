import express from 'express';
import { getStats } from '../controllers/dashboard.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';

const router = express.Router();

// Middleware de sécurité appliqué à toutes les routes dashboard
router.use(verifyToken, authorize(['admin', 'manager']));

// Routes
router.get('/stats', getStats);

export default router;