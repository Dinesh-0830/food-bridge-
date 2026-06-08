import { Router } from 'express';
import { getAllUsers, approveUser, getAnalytics, approveNgoDocs } from '../controllers/adminController';
import { authenticate, restrictTo } from '../middleware/auth';
import { Role } from '../types/enums';

const router = Router();

router.use(authenticate);
router.use(restrictTo(Role.ADMIN));

router.get('/users', getAllUsers);
router.put('/users/:id/approve', approveUser);
router.put('/ngos/:id/approve-docs', approveNgoDocs);
router.get('/analytics', getAnalytics);

export default router;
