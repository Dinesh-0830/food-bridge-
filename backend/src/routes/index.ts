import { Router } from 'express';
import authRoutes from './authRoutes';
import donationRoutes from './donationRoutes';
import ngoRoutes from './ngoRoutes';
import volunteerRoutes from './volunteerRoutes';
import adminRoutes from './adminRoutes';
import featureRoutes from './featureRoutes';
import apiRoutes from './apiRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/donations', donationRoutes);
router.use('/ngo', ngoRoutes);
router.use('/volunteer', volunteerRoutes);
router.use('/admin', adminRoutes);
router.use('/api/v1', apiRoutes);
router.use('/', featureRoutes);

export default router;
