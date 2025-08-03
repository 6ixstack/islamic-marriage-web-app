"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminController_1 = require("../controllers/adminController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All admin routes require authentication and admin role
router.get('/profiles/pending', auth_1.authenticateToken, auth_1.requireAdmin, adminController_1.getPendingProfiles);
router.post('/profiles/:id/approve', auth_1.authenticateToken, auth_1.requireAdmin, adminController_1.approveProfile);
router.post('/profiles/:id/reject', auth_1.authenticateToken, auth_1.requireAdmin, adminController_1.rejectProfile);
router.get('/stats', auth_1.authenticateToken, auth_1.requireAdmin, adminController_1.getStats);
router.get('/users', auth_1.authenticateToken, auth_1.requireAdmin, adminController_1.getAllUsers);
router.patch('/users/:id/role', auth_1.authenticateToken, auth_1.requireAdmin, adminController_1.updateUserRole);
router.get('/actions', auth_1.authenticateToken, auth_1.requireAdmin, adminController_1.getAdminActions);
exports.default = router;
