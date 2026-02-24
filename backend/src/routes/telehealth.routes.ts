// ===========================================
// LIFELINK - Telehealth Routes
// ===========================================

import { Router } from 'express';
import { TelehealthController } from '../controllers/telehealth.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Webhook (no auth)
router.post('/webhook', TelehealthController.webhook as any);

router.use(authenticate);

router.get('/:roomId/join', TelehealthController.joinSession);
router.put('/:roomId/start', authorize('DOCTOR', 'PSYCHIATRIST', 'THERAPIST'), TelehealthController.startSession);
router.put('/:roomId/end', authorize('DOCTOR', 'PSYCHIATRIST', 'THERAPIST', 'SUPER_ADMIN'), TelehealthController.endSession);
router.put('/:roomId/recording', TelehealthController.enableRecording);

export default router;
