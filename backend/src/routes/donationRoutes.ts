import { Router } from 'express';
import { createDonation, getDonations, getDonationById, updateDonation, deleteDonation } from '../controllers/donationController';
import { authenticate, requireApproval } from '../middleware/auth';

const router = Router();

// Secure all donation endpoints
router.use(authenticate);
router.use(requireApproval);

router.post('/', createDonation);
router.get('/', getDonations);
router.get('/:id', getDonationById);
router.put('/:id', updateDonation);
router.delete('/:id', deleteDonation);

export default router;
