import express from 'express';
import { getMouvementsByProduct, createMouvement } from '../controllers/mouvementStock.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';

const router = express.Router();

router.use(verifyToken);
router.use(authorize(['manager', 'admin']));

router.get('/product/:productId', getMouvementsByProduct);
router.post('/', createMouvement);

export default router;
