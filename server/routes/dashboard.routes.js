import express from 'express';
import { getStats, getAdminStats } from '../controllers/dashboard.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import { optionalStoreContext } from '../middlewares/store-context.middleware.js';

const router = express.Router();

router.use(verifyToken, authorize(['admin', 'manager']), optionalStoreContext);

router.get('/stats', getStats);
router.get('/admin', authorize(['admin']), getAdminStats);

export default router;