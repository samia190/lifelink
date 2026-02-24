// ===========================================
// LIFELINK - Chat Routes
// ===========================================

import { Router } from 'express';
import { ChatController } from '../controllers/chat.controller';
import { optionalAuth, authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { chatMessageSchema } from '../validators/schemas';

const router = Router();

router.post('/message', optionalAuth, validate(chatMessageSchema), ChatController.sendMessage);
router.post('/intake', optionalAuth, ChatController.submitIntake);
router.get('/conversation/:id', authenticate, ChatController.getConversation);

export default router;
