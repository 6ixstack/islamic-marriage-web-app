import express, { Router } from 'express';
import { 
  createProfile, 
  getProfiles, 
  getProfile, 
  getUserProfile,
  updateProfile, 
  deleteProfile 
} from '../controllers/profileController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', getProfiles); // Get all approved profiles

// Protected routes
router.post('/', authenticateToken, createProfile); // Create profile
router.get('/my', authenticateToken, getUserProfile); // Get user's own profile
router.get('/:id', getProfile); // Get specific profile by ID
router.put('/:id', authenticateToken, updateProfile); // Update profile
router.delete('/:id', authenticateToken, deleteProfile); // Delete/withdraw profile

export default router;