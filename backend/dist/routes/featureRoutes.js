"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const featureController_1 = require("../controllers/featureController");
const router = (0, express_1.Router)();
// Apply authenticate middleware to all sub-routes
router.use(auth_1.authenticate);
// AI & Quality APIs
router.post('/ai/predict-leftovers', featureController_1.predictLeftovers);
router.post('/ai/verify-image', featureController_1.verifyImage);
router.get('/donations/smart-match', featureController_1.getSmartMatch);
// Analytics & Heatmap APIs
router.get('/analytics/waste', featureController_1.getWasteAnalytics);
router.get('/analytics/heatmap', featureController_1.getHungerHeatmap);
router.get('/analytics/leaderboard', featureController_1.getLeaderboard);
// Emergency NGO Requests APIs
router.post('/emergency-requests', featureController_1.createEmergencyRequest);
router.get('/emergency-requests', featureController_1.getEmergencyRequests);
// Advanced Startup features APIs
router.post('/disaster/toggle', featureController_1.toggleDisasterMode);
router.get('/disaster/status', featureController_1.getDisasterStatus);
router.post('/schedules', featureController_1.createSchedule);
router.get('/schedules', featureController_1.getSchedules);
router.delete('/schedules/:id', featureController_1.deleteSchedule);
router.get('/fridges', featureController_1.getFridges);
router.post('/fridges/refill/:id', featureController_1.refillFridge);
router.post('/nutrition/analyze', featureController_1.analyzeNutrition);
router.post('/chatbot/ask', featureController_1.askChatbot);
router.get('/volunteer/achievements', featureController_1.getVolunteerAchievements);
router.post('/referrals', featureController_1.createReferral);
router.get('/referrals', featureController_1.getReferrals);
router.get('/cold-storages', featureController_1.getColdStorages);
router.get('/csr/export', featureController_1.exportCsrReport);
exports.default = router;
