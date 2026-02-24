// ===========================================
// LIFELINK - Payment Routes
// ===========================================

import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { mpesaPaymentSchema } from '../validators/schemas';

const router = Router();

// M-Pesa callback (no auth - from Safaricom)
router.post('/mpesa/callback', PaymentController.mpesaCallback);

// Authenticated routes
router.use(authenticate);

router.post('/mpesa/initiate', validate(mpesaPaymentSchema), PaymentController.initiateMpesa);
router.get('/:id/status', PaymentController.checkStatus);
router.get('/', authorize('SUPER_ADMIN', 'ACCOUNTANT', 'RECEPTIONIST'), PaymentController.list);
router.post('/invoices', authorize('SUPER_ADMIN', 'ACCOUNTANT'), PaymentController.createInvoice);
router.get('/invoices', PaymentController.getInvoices);

export default router;
