import { Router } from 'express';
import { login, register, verifyEmail, getProfile } from '@/controllers/authController';
import { authenticateToken } from '@/middleware/auth';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.get('/verify-email/:token', verifyEmail);
router.get('/profile', authenticateToken, getProfile);

export default router;