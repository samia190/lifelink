// ===========================================
// LIFELINK - Content Management Routes (Admin)
// ===========================================

import { Router } from 'express';
import { ContentController } from '../controllers/content.controller';
import { authenticate, authorize } from '../middleware/auth';
import { uploadImage, uploadMedia } from '../middleware/upload';

const router = Router();

router.use(authenticate);
router.use(authorize('SUPER_ADMIN'));

// Blog admin CRUD
router.get('/blog', ContentController.listAll);
router.post('/blog', uploadImage, ContentController.create);
router.put('/blog/:id', uploadImage, ContentController.update);
router.delete('/blog/:id', ContentController.delete);

// Media upload
router.post('/upload', uploadMedia, ContentController.uploadMedia);

// AI content generation
router.post('/generate', ContentController.generateContent);

export default router;
