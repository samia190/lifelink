// ===========================================
// LIFELINK - Patient Routes
// ===========================================

import { Router } from 'express';
import { PatientController } from '../controllers/patient.controller';
import { authenticate, authorize } from '../middleware/auth';
import { auditLog } from '../middleware/audit';

const router = Router();

router.use(authenticate);

router.get('/', authorize('SUPER_ADMIN', 'DOCTOR', 'PSYCHIATRIST', 'THERAPIST', 'RECEPTIONIST'), PatientController.list);
router.get('/risk-alerts', authorize('SUPER_ADMIN', 'DOCTOR', 'PSYCHIATRIST', 'THERAPIST'), PatientController.getRiskAlerts);
router.get('/:id', PatientController.getById);
router.put('/:id', auditLog('UPDATE', 'Patient'), PatientController.update);
router.post('/:id/medical-records', authorize('DOCTOR', 'PSYCHIATRIST', 'THERAPIST'), auditLog('CREATE', 'MedicalRecord'), PatientController.createMedicalRecord);
router.post('/:id/session-notes', authorize('DOCTOR', 'PSYCHIATRIST', 'THERAPIST'), auditLog('CREATE', 'SessionNote'), PatientController.createSessionNote);
router.post('/:id/prescriptions', authorize('DOCTOR', 'PSYCHIATRIST'), auditLog('CREATE', 'Prescription'), PatientController.createPrescription);
router.post('/:id/risk-assessment', authorize('SUPER_ADMIN', 'DOCTOR', 'PSYCHIATRIST', 'THERAPIST'), PatientController.assessRisk);
router.get('/:id/progress', PatientController.getProgress);
router.post('/:id/progress', PatientController.addProgress);
router.put('/risk-alerts/:alertId/resolve', authorize('SUPER_ADMIN', 'DOCTOR', 'PSYCHIATRIST', 'THERAPIST'), PatientController.resolveAlert);

export default router;
