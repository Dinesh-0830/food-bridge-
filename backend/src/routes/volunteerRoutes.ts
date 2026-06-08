import { Router } from 'express';
import { getAvailableAssignments, acceptAssignment, updateDeliveryStatus, uploadProof, updateLocation } from '../controllers/volunteerController';
import { authenticate, restrictTo, requireApproval } from '../middleware/auth';
import { Role } from '../types/enums';

const router = Router();

router.use(authenticate);
router.use(requireApproval);

// Restricted to VOLUNTEER or ADMIN
router.use(restrictTo(Role.VOLUNTEER, Role.ADMIN));

router.get('/available', getAvailableAssignments);
router.post('/accept/:id', acceptAssignment);
router.post('/update-status/:id', updateDeliveryStatus);
router.post('/proof/:id', uploadProof);
router.post('/location', updateLocation);

export default router;
