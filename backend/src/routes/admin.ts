import express, { Router } from 'express';
import { 
  getPendingProfiles,
  approveProfile,
  rejectProfile,
  getStats,
  getAllUsers,
  updateUserRole,
  getAdminActions
} from '../controllers/adminController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

// All admin routes require authentication and admin role
router.get('/profiles/pending', authenticateToken, requireAdmin, getPendingProfiles);
router.post('/profiles/:id/approve', authenticateToken, requireAdmin, approveProfile);
router.post('/profiles/:id/reject', authenticateToken, requireAdmin, rejectProfile);
router.get('/stats', authenticateToken, requireAdmin, getStats);
router.get('/users', authenticateToken, requireAdmin, getAllUsers);
router.patch('/users/:id/role', authenticateToken, requireAdmin, updateUserRole);
router.get('/actions', authenticateToken, requireAdmin, getAdminActions);

export default router;