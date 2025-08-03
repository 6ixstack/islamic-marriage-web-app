import express, { Router } from 'express';
import { 
  expressInterest,
  withdrawInterest,
  getMyInterests,
  getInterestsInMyProfile,
  getMutualInterests
} from '../controllers/interestController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All interest routes require authentication
router.post('/', authenticateToken, expressInterest); // Express interest in a profile
router.delete('/:id', authenticateToken, withdrawInterest); // Withdraw interest
router.get('/my', authenticateToken, getMyInterests); // Get interests I've expressed
router.get('/received', authenticateToken, getInterestsInMyProfile); // Get interests in my profile
router.get('/mutual', authenticateToken, getMutualInterests); // Get mutual interests

export default router;