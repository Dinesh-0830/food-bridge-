import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  predictLeftovers,
  verifyImage,
  getSmartMatch,
  getWasteAnalytics,
  getLeaderboard,
  createEmergencyRequest,
  getEmergencyRequests,
  getHungerHeatmap,
  toggleDisasterMode,
  getDisasterStatus,
  createSchedule,
  getSchedules,
  deleteSchedule,
  getFridges,
  refillFridge,
  analyzeNutrition,
  askChatbot,
  getVolunteerAchievements,
  createReferral,
  getReferrals,
  getColdStorages,
  exportCsrReport
} from '../controllers/featureController';

const router = Router();

// Apply authenticate middleware to all sub-routes
router.use(authenticate);

// AI & Quality APIs
router.post('/ai/predict-leftovers', predictLeftovers);
router.post('/ai/verify-image', verifyImage);
router.get('/donations/smart-match', getSmartMatch);

// Analytics & Heatmap APIs
router.get('/analytics/waste', getWasteAnalytics);
router.get('/analytics/heatmap', getHungerHeatmap);
router.get('/analytics/leaderboard', getLeaderboard);

// Emergency NGO Requests APIs
router.post('/emergency-requests', createEmergencyRequest);
router.get('/emergency-requests', getEmergencyRequests);

// Advanced Startup features APIs
router.post('/disaster/toggle', toggleDisasterMode);
router.get('/disaster/status', getDisasterStatus);

router.post('/schedules', createSchedule);
router.get('/schedules', getSchedules);
router.delete('/schedules/:id', deleteSchedule);

router.get('/fridges', getFridges);
router.post('/fridges/refill/:id', refillFridge);

router.post('/nutrition/analyze', analyzeNutrition);
router.post('/chatbot/ask', askChatbot);

router.get('/volunteer/achievements', getVolunteerAchievements);

router.post('/referrals', createReferral);
router.get('/referrals', getReferrals);

router.get('/cold-storages', getColdStorages);
router.get('/csr/export', exportCsrReport);

export default router;
