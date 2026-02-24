// ===========================================
// LIFELINK - Corporate Routes
// ===========================================

import { Router } from 'express';
import { CorporateController } from '../controllers/corporate.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { corporateAccountSchema } from '../validators/schemas';

const router = Router();

router.use(authenticate);

router.post('/', authorize('SUPER_ADMIN'), validate(corporateAccountSchema), CorporateController.create);
router.get('/', authorize('SUPER_ADMIN', 'CORPORATE_MANAGER', 'ACCOUNTANT'), CorporateController.list);
router.get('/:id', CorporateController.getById);
router.put('/:id', authorize('SUPER_ADMIN'), CorporateController.update);
router.post('/:corporateId/employees', authorize('SUPER_ADMIN', 'CORPORATE_MANAGER'), CorporateController.onboardEmployees);
router.get('/:corporateId/usage-report', CorporateController.getUsageReport);
router.get('/:corporateId/hr-dashboard', CorporateController.getHRDashboard);

export default router;
