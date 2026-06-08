"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const volunteerController_1 = require("../controllers/volunteerController");
const auth_1 = require("../middleware/auth");
const enums_1 = require("../types/enums");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.use(auth_1.requireApproval);
// Restricted to VOLUNTEER or ADMIN
router.use((0, auth_1.restrictTo)(enums_1.Role.VOLUNTEER, enums_1.Role.ADMIN));
router.get('/available', volunteerController_1.getAvailableAssignments);
router.post('/accept/:id', volunteerController_1.acceptAssignment);
router.post('/update-status/:id', volunteerController_1.updateDeliveryStatus);
router.post('/proof/:id', volunteerController_1.uploadProof);
router.post('/location', volunteerController_1.updateLocation);
exports.default = router;
