import { Router } from 'express';
import { getNgoDashboardData, assignDestinationAndVolunteer, verifyDelivery, getDestinations, updateNgoProfile, getVolunteersForNgo } from '../controllers/ngoController';
import { authenticate, restrictTo, requireApproval } from '../middleware/auth';
import { Role } from '../types/enums';

const router = Router();

router.use(authenticate);
router.use(requireApproval);
router.use(restrictTo(Role.NGO, Role.ADMIN));

router.get('/dashboard', getNgoDashboardData);
router.get('/destinations', getDestinations);
router.get('/volunteers', getVolunteersForNgo);
router.post('/assign', assignDestinationAndVolunteer);
router.post('/verify', verifyDelivery);
router.put('/profile', updateNgoProfile);

export default router;
