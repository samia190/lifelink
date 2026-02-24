// ===========================================
// LIFELINK - Dashboard Routes
// ===========================================

import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// ===== ADMIN routes =====
router.get('/analytics', authorize('SUPER_ADMIN', 'ACCOUNTANT'), DashboardController.getAnalytics);
router.get('/revenue-chart', authorize('SUPER_ADMIN', 'ACCOUNTANT'), DashboardController.getRevenueChart);
router.get('/geo-distribution', authorize('SUPER_ADMIN', 'ACCOUNTANT'), DashboardController.getGeoDistribution);
router.get('/corporate-analytics', authorize('SUPER_ADMIN', 'ACCOUNTANT'), DashboardController.getCorporateAnalytics);
router.get('/growth-forecast', authorize('SUPER_ADMIN', 'ACCOUNTANT'), DashboardController.getGrowthForecast);
router.get('/system-health', authorize('SUPER_ADMIN'), DashboardController.getSystemHealth);
router.get('/audit-logs', authorize('SUPER_ADMIN'), DashboardController.getAuditLogs);
router.get('/risk-alerts', authorize('SUPER_ADMIN', 'DOCTOR', 'PSYCHIATRIST', 'THERAPIST'), DashboardController.listRiskAlerts);
router.patch('/risk-alerts/:id/resolve', authorize('SUPER_ADMIN', 'DOCTOR', 'PSYCHIATRIST', 'THERAPIST'), DashboardController.resolveAlert);
router.get('/recent-activity', authorize('SUPER_ADMIN'), DashboardController.getRecentActivity);

// ===== Doctor management (admin) =====
router.post('/doctors', authorize('SUPER_ADMIN'), DashboardController.createDoctor);
router.get('/doctors', authorize('SUPER_ADMIN', 'ACCOUNTANT'), DashboardController.listDoctors);
router.get('/doctors/:id', authorize('SUPER_ADMIN'), DashboardController.getDoctorDetail);
router.put('/doctors/:id', authorize('SUPER_ADMIN'), DashboardController.updateDoctor);

// ===== Patient management (admin) =====
router.get('/patients', authorize('SUPER_ADMIN', 'ACCOUNTANT', 'RECEPTIONIST'), DashboardController.listPatients);
router.get('/patients/:id', authorize('SUPER_ADMIN', 'DOCTOR', 'PSYCHIATRIST', 'THERAPIST'), DashboardController.getPatientDetail);
router.post('/patients/assign', authorize('SUPER_ADMIN'), DashboardController.assignPatientToDoctor);

// ===== User management (admin) =====
router.patch('/users/:id/toggle-active', authorize('SUPER_ADMIN'), DashboardController.toggleUserActive);
router.post('/users/:id/reset-password', authorize('SUPER_ADMIN'), DashboardController.resetUserPassword);

// ===== Telehealth (admin) =====
router.get('/telehealth-sessions', authorize('SUPER_ADMIN'), DashboardController.listTelehealthSessions);

// ===== Webinar management (admin) =====
router.get('/webinars', authorize('SUPER_ADMIN'), DashboardController.listWebinars);
router.post('/webinars', authorize('SUPER_ADMIN'), DashboardController.createWebinar);
router.put('/webinars/:id', authorize('SUPER_ADMIN'), DashboardController.updateWebinar);

// ===== Invoice management (admin) =====
router.post('/invoices', authorize('SUPER_ADMIN', 'ACCOUNTANT'), DashboardController.createInvoice);
router.get('/invoices', authorize('SUPER_ADMIN', 'ACCOUNTANT'), DashboardController.listInvoices);

// ===== Doctor routes =====
router.get('/doctor', authorize('DOCTOR', 'PSYCHIATRIST', 'THERAPIST', 'SUPER_ADMIN'), DashboardController.getDoctorDashboard);
router.get('/doctor/patients', authorize('DOCTOR', 'PSYCHIATRIST', 'THERAPIST', 'SUPER_ADMIN'), DashboardController.getDoctorPatients);

// ===== Patient routes =====
router.get('/patient', authorize('PATIENT'), DashboardController.getPatientDashboard);
router.post('/patient/wellness', authorize('PATIENT'), DashboardController.recordWellness);

// ===== Corporate routes =====
router.get('/corporate', authorize('CORPORATE_MANAGER'), DashboardController.getCorporateDashboard);

export default router;
