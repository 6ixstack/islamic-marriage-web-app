"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const profileController_1 = require("../controllers/profileController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Public routes
router.get('/', profileController_1.getProfiles); // Get all approved profiles
// Protected routes
router.post('/', auth_1.authenticateToken, profileController_1.createProfile); // Create profile
router.get('/my', auth_1.authenticateToken, profileController_1.getUserProfile); // Get user's own profile
router.get('/:id', profileController_1.getProfile); // Get specific profile by ID
router.put('/:id', auth_1.authenticateToken, profileController_1.updateProfile); // Update profile
router.delete('/:id', auth_1.authenticateToken, profileController_1.deleteProfile); // Delete/withdraw profile
exports.default = router;
