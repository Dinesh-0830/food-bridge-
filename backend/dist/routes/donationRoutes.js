"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const donationController_1 = require("../controllers/donationController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Secure all donation endpoints
router.use(auth_1.authenticate);
router.use(auth_1.requireApproval);
router.post('/', donationController_1.createDonation);
router.get('/', donationController_1.getDonations);
router.get('/:id', donationController_1.getDonationById);
router.put('/:id', donationController_1.updateDonation);
router.delete('/:id', donationController_1.deleteDonation);
exports.default = router;
