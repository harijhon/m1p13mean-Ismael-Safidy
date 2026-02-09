import express from 'express';
import { register, login, createManager } from '../controllers/auth.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';

const router = express.Router();

// Routes Auth publiques
router.post('/register', register);
router.post('/login', login);

// Routes Auth protégées (Admin only)
router.post('/create-manager', verifyToken, authorize(['admin']), createManager);

export default router;
