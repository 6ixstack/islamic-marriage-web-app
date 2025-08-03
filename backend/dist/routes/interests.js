"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const interestController_1 = require("../controllers/interestController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All interest routes require authentication
router.post('/', auth_1.authenticateToken, interestController_1.expressInterest); // Express interest in a profile
router.delete('/:id', auth_1.authenticateToken, interestController_1.withdrawInterest); // Withdraw interest
router.get('/my', auth_1.authenticateToken, interestController_1.getMyInterests); // Get interests I've expressed
router.get('/received', auth_1.authenticateToken, interestController_1.getInterestsInMyProfile); // Get interests in my profile
router.get('/mutual', auth_1.authenticateToken, interestController_1.getMutualInterests); // Get mutual interests
exports.default = router;
