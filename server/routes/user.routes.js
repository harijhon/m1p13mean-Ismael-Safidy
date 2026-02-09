import express from 'express';
import { getAllUsers, createUser, updateUser, deleteUser } from '../controllers/user.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';

const router = express.Router();

// Middleware de sécurité appliqué à toutes les routes user
// Seuls les admins peuvent gérer les utilisateurs
router.use(verifyToken, authorize(['admin']));

// Routes CRUD
router.get('/', getAllUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
