// ===========================================
// LIFELINK - Main Route Index
// ===========================================

import { Router } from 'express';
import authRoutes from './auth.routes';
import appointmentRoutes from './appointment.routes';
import patientRoutes from './patient.routes';
import chatRoutes from './chat.routes';
import paymentRoutes from './payment.routes';
import dashboardRoutes from './dashboard.routes';
import corporateRoutes from './corporate.routes';
import webinarRoutes from './webinar.routes';
import telehealthRoutes from './telehealth.routes';
import publicRoutes from './public.routes';
import notificationRoutes from './notification.routes';
import contentRoutes from './content.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/patients', patientRoutes);
router.use('/chat', chatRoutes);
router.use('/payments', paymentRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/corporate', corporateRoutes);
router.use('/webinars', webinarRoutes);
router.use('/telehealth', telehealthRoutes);
router.use('/notifications', notificationRoutes);
router.use('/content', contentRoutes);
router.use('/', publicRoutes);

export default router;
