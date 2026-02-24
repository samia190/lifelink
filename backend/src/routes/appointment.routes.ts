// ===========================================
// LIFELINK - Appointment Routes
// ===========================================

import { Router } from 'express';
import { AppointmentController } from '../controllers/appointment.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { appointmentSchema } from '../validators/schemas';
import { auditLog } from '../middleware/audit';

const router = Router();

router.use(authenticate);

router.post('/', validate(appointmentSchema), auditLog('CREATE', 'Appointment'), AppointmentController.create);
router.get('/', AppointmentController.list);
router.get('/available-slots', AppointmentController.getAvailableSlots);
router.get('/:id', AppointmentController.getById);
router.put('/:id/confirm', authorize('SUPER_ADMIN', 'RECEPTIONIST', 'DOCTOR', 'PSYCHIATRIST', 'THERAPIST'), auditLog('CONFIRM', 'Appointment'), AppointmentController.confirm);
router.put('/:id/cancel', auditLog('CANCEL', 'Appointment'), AppointmentController.cancel);
router.put('/:id/reschedule', auditLog('RESCHEDULE', 'Appointment'), AppointmentController.reschedule);

export default router;
