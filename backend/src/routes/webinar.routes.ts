// ===========================================
// LIFELINK - Webinar Routes
// ===========================================

import { Router } from 'express';
import { WebinarController } from '../controllers/webinar.controller';
import { authenticate, authorize, optionalAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { webinarSchema } from '../validators/schemas';

const router = Router();

// Public routes
router.get('/', optionalAuth, WebinarController.list);
router.get('/:id', optionalAuth, WebinarController.getById);
router.post('/:id/register', WebinarController.register);
router.post('/:id/comments', WebinarController.addComment);

// Authenticated routes
router.use(authenticate);

router.post('/', authorize('SUPER_ADMIN', 'DOCTOR', 'PSYCHIATRIST', 'THERAPIST'), validate(webinarSchema), WebinarController.create);
router.put('/:id', authorize('SUPER_ADMIN'), WebinarController.update);
router.put('/:id/start', authorize('SUPER_ADMIN'), WebinarController.startLive);
router.put('/:id/end', authorize('SUPER_ADMIN'), WebinarController.endLive);
router.put('/:id/comments/:commentId/moderate', authorize('SUPER_ADMIN'), WebinarController.moderateComment);
router.put('/:id/comments/:commentId/answer', authorize('SUPER_ADMIN', 'DOCTOR'), WebinarController.answerQuestion);
router.post('/registrations/:registrationId/certificate', authorize('SUPER_ADMIN'), WebinarController.generateCertificate);

export default router;
