// ===========================================
// LIFELINK - Public Routes (Blog, Services)
// ===========================================

import { Router } from 'express';
import { BlogController } from '../controllers/blog.controller';
import { ServiceController } from '../controllers/service.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { blogPostSchema } from '../validators/schemas';

const router = Router();

// Public service routes
router.get('/services', ServiceController.list);
router.get('/services/:slug', ServiceController.getBySlug);
router.get('/doctors', ServiceController.getDoctors);

// Public blog routes
router.get('/blog', BlogController.list);
router.get('/blog/:slug', BlogController.getBySlug);

// Admin routes
router.post('/services', authenticate, authorize('SUPER_ADMIN'), ServiceController.create);
router.put('/services/:id', authenticate, authorize('SUPER_ADMIN'), ServiceController.update);
router.post('/blog', authenticate, authorize('SUPER_ADMIN', 'DOCTOR', 'PSYCHIATRIST', 'THERAPIST'), validate(blogPostSchema), BlogController.create);
router.put('/blog/:id', authenticate, authorize('SUPER_ADMIN'), BlogController.update);
router.delete('/blog/:id', authenticate, authorize('SUPER_ADMIN'), BlogController.delete);

// Public corporate join (no auth needed)
import { DashboardController } from '../controllers/dashboard.controller';
router.post('/corporate/join', DashboardController.corporateJoin as any);

export default router;
