// ===========================================
// LIFELINK - Automation Engine (Cron Jobs)
// ===========================================

import cron from 'node-cron';
import prisma from '../config/database';
import logger from '../config/logger';
import { EmailService } from '../services/email.service';
import { SMSService } from '../services/sms.service';

const emailService = new EmailService();
const smsService = new SMSService();

export class AutomationEngine {
  static init() {
    logger.info('🤖 Automation Engine initialized');

    // ===== Every 30 minutes: Appointment Reminders =====
    cron.schedule('*/30 * * * *', async () => {
      await AutomationEngine.sendAppointmentReminders();
    });

    // ===== Every hour: Missed session follow-up =====
    cron.schedule('0 * * * *', async () => {
      await AutomationEngine.handleMissedSessions();
    });

    // ===== Every day at 9 AM: Payment reminders =====
    cron.schedule('0 9 * * *', async () => {
      await AutomationEngine.sendPaymentReminders();
    });

    // ===== Every day at 10 AM: Therapy progress check-ins =====
    cron.schedule('0 10 * * *', async () => {
      await AutomationEngine.sendProgressCheckIns();
    });

    // ===== Every week on Monday 8 AM: Feedback requests =====
    cron.schedule('0 8 * * 1', async () => {
      await AutomationEngine.sendFeedbackRequests();
    });

    // ===== Every day at 8 AM: Risk escalation alerts =====
    cron.schedule('0 8 * * *', async () => {
      await AutomationEngine.checkRiskEscalations();
    });

    // ===== 1st of month at 6 AM: Monthly reports =====
    cron.schedule('0 6 1 * *', async () => {
      await AutomationEngine.generateMonthlyReports();
    });

    // ===== Every day at 2 AM: Cleanup expired sessions =====
    cron.schedule('0 2 * * *', async () => {
      await AutomationEngine.cleanupExpiredSessions();
    });

    // ===== Every 15 minutes: Corporate follow-ups =====
    cron.schedule('*/15 * * * *', async () => {
      await AutomationEngine.corporateFollowUps();
    });

    // ===== Every day at 11 AM: Lead nurturing =====
    cron.schedule('0 11 * * *', async () => {
      await AutomationEngine.leadNurturing();
    });

    // ===== Every Wednesday at 7 AM: Auto-generate blog content =====
    cron.schedule('0 7 * * 3', async () => {
      await AutomationEngine.autoGenerateContent();
    });
  }

  // Send reminders for upcoming appointments (24h and 1h before)
  static async sendAppointmentReminders() {
    try {
      const now = new Date();
      const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const in1Hour = new Date(now.getTime() + 60 * 60 * 1000);

      // 24-hour reminders
      const upcomingAppointments = await prisma.appointment.findMany({
        where: {
          status: { in: ['PENDING', 'CONFIRMED'] },
          reminderSent: false,
          startTime: { gte: now, lte: in24Hours },
        },
        include: {
          patient: { include: { user: { include: { profile: true } } } },
          doctor: { include: { user: { include: { profile: true } } } },
        },
      });

      for (const appt of upcomingAppointments) {
        const patientName = appt.patient.user.profile?.firstName || 'Patient';
        const doctorName = `${appt.doctor.user.profile?.firstName} ${appt.doctor.user.profile?.lastName}`;
        const date = appt.appointmentDate.toLocaleDateString();
        const time = appt.startTime.toLocaleTimeString();

        try {
          await emailService.sendAppointmentReminder(appt.patient.user.email, {
            patientName,
            doctorName,
            date,
            time,
            type: appt.type,
          });

          if (appt.patient.user.phone) {
            await smsService.sendAppointmentReminder(appt.patient.user.phone, {
              patientName,
              doctorName,
              date,
              time,
            });
          }

          await prisma.appointment.update({
            where: { id: appt.id },
            data: { reminderSent: true },
          });
        } catch (err) {
          logger.error(`Failed to send reminder for appointment ${appt.id}:`, err);
        }
      }

      if (upcomingAppointments.length > 0) {
        logger.info(`Sent ${upcomingAppointments.length} appointment reminders`);
      }
    } catch (error) {
      logger.error('Appointment reminder automation failed:', error);
    }
  }

  // Handle missed sessions (no-show flagging)
  static async handleMissedSessions() {
    try {
      const cutoff = new Date(Date.now() - 30 * 60 * 1000); // 30 min past

      const missedAppointments = await prisma.appointment.findMany({
        where: {
          status: 'CONFIRMED',
          startTime: { lte: cutoff },
          checkedInAt: null,
        },
        include: {
          patient: { include: { user: { include: { profile: true } } } },
        },
      });

      for (const appt of missedAppointments) {
        await prisma.appointment.update({
          where: { id: appt.id },
          data: { status: 'NO_SHOW' },
        });

        // Send follow-up email
        try {
          const patientName = appt.patient.user.profile?.firstName || 'Patient';
          await emailService.sendAppointmentReminder(appt.patient.user.email, {
            patientName,
            doctorName: 'your doctor',
            date: 'your scheduled appointment',
            time: 'today',
            type: 'follow-up',
          });
        } catch {}
      }

      if (missedAppointments.length > 0) {
        logger.info(`Flagged ${missedAppointments.length} no-show appointments`);
      }
    } catch (error) {
      logger.error('Missed session handler failed:', error);
    }
  }

  // Send payment reminders for pending invoices
  static async sendPaymentReminders() {
    try {
      const overdueInvoices = await prisma.invoice.findMany({
        where: {
          status: 'SENT',
          dueDate: { lte: new Date() },
        },
        include: {
          patient: { include: { user: { include: { profile: true } } } },
        },
      });

      for (const invoice of overdueInvoices) {
        await prisma.invoice.update({
          where: { id: invoice.id },
          data: { status: 'OVERDUE' },
        });

        // Send reminder (using patient's email if available)
        if (invoice.patient?.user?.email) {
          // Would send payment reminder email here
        }
      }

      if (overdueInvoices.length > 0) {
        logger.info(`Processed ${overdueInvoices.length} overdue invoices`);
      }
    } catch (error) {
      logger.error('Payment reminder automation failed:', error);
    }
  }

  // Therapy progress check-ins
  static async sendProgressCheckIns() {
    try {
      // Find patients with active treatment plans who haven't had progress recorded in 7+ days
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const patients = await prisma.patient.findMany({
        where: {
          isActive: true,
          treatmentPlans: { some: { status: 'active' } },
          progressTracking: { none: { recordedAt: { gte: sevenDaysAgo } } },
        },
        include: { user: { include: { profile: true } } },
      });

      for (const patient of patients) {
        // Create in-app notification
        await prisma.notification.create({
          data: {
            userId: patient.userId,
            type: 'IN_APP',
            title: 'Progress Check-in',
            message: 'How are you feeling this week? Take a moment to record your progress.',
          },
        });
      }

      if (patients.length > 0) {
        logger.info(`Sent ${patients.length} progress check-in notifications`);
      }
    } catch (error) {
      logger.error('Progress check-in automation failed:', error);
    }
  }

  // Send feedback requests after completed sessions
  static async sendFeedbackRequests() {
    try {
      const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const completedSessions = await prisma.appointment.findMany({
        where: {
          status: 'COMPLETED',
          completedAt: { gte: lastWeek },
        },
        include: {
          patient: { include: { user: { include: { profile: true } } } },
        },
      });

      for (const session of completedSessions) {
        await prisma.notification.create({
          data: {
            userId: session.patient.userId,
            type: 'IN_APP',
            title: 'Session Feedback',
            message: 'We\'d love to hear about your recent session. Your feedback helps us improve.',
          },
        });
      }
    } catch (error) {
      logger.error('Feedback request automation failed:', error);
    }
  }

  // Check and escalate risk alerts
  static async checkRiskEscalations() {
    try {
      const unresolvedCritical = await prisma.riskAlert.findMany({
        where: {
          isResolved: false,
          riskLevel: { in: ['CRITICAL', 'HIGH'] },
          createdAt: { lte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Older than 24h
        },
        include: {
          patient: { include: { user: { include: { profile: true } } } },
        },
      });

      if (unresolvedCritical.length > 0) {
        // Alert all admins about unresolved critical alerts
        const admins = await prisma.user.findMany({
          where: { role: 'SUPER_ADMIN', isActive: true },
        });

        for (const admin of admins) {
          await prisma.notification.create({
            data: {
              userId: admin.id,
              type: 'IN_APP',
              title: `⚠️ ${unresolvedCritical.length} Unresolved Risk Alerts`,
              message: `There are ${unresolvedCritical.length} unresolved HIGH/CRITICAL risk alerts older than 24 hours.`,
            },
          });
        }

        logger.warn(`${unresolvedCritical.length} unresolved critical risk alerts escalated`);
      }
    } catch (error) {
      logger.error('Risk escalation check failed:', error);
    }
  }

  // Generate monthly financial reports
  static async generateMonthlyReports() {
    try {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      const startOfLastMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
      const endOfLastMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0);

      const [revenue, appointments, newPatients, corporateRevenue] = await Promise.all([
        prisma.payment.aggregate({
          where: { status: 'COMPLETED', paidAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
          _sum: { amount: true },
          _count: true,
        }),
        prisma.appointment.groupBy({
          by: ['status'],
          where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
          _count: true,
        }),
        prisma.patient.count({
          where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
        }),
        prisma.invoice.aggregate({
          where: {
            corporateId: { not: null },
            status: 'PAID',
            paidDate: { gte: startOfLastMonth, lte: endOfLastMonth },
          },
          _sum: { total: true },
        }),
      ]);

      // Store report as analytics event
      await prisma.analyticsEvent.create({
        data: {
          eventType: 'MONTHLY_REPORT',
          data: {
            month: `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`,
            totalRevenue: revenue._sum.amount || 0,
            totalPayments: revenue._count,
            appointments,
            newPatients,
            corporateRevenue: corporateRevenue._sum.total || 0,
          },
        },
      });

      logger.info('Monthly report generated successfully');
    } catch (error) {
      logger.error('Monthly report generation failed:', error);
    }
  }

  // Cleanup expired refresh sessions
  static async cleanupExpiredSessions() {
    try {
      const deleted = await prisma.refreshSession.deleteMany({
        where: { expiresAt: { lte: new Date() } },
      });

      if (deleted.count > 0) {
        logger.info(`Cleaned up ${deleted.count} expired sessions`);
      }
    } catch (error) {
      logger.error('Session cleanup failed:', error);
    }
  }

  // Corporate follow-ups for expiring contracts
  static async corporateFollowUps() {
    try {
      const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      const expiringContracts = await prisma.corporateAccount.findMany({
        where: {
          contractStatus: 'ACTIVE',
          contractEndDate: { lte: in30Days, gte: new Date() },
        },
      });

      for (const contract of expiringContracts) {
        // Create notification for admin
        const admins = await prisma.user.findMany({
          where: { role: 'SUPER_ADMIN' },
        });

        for (const admin of admins) {
          const existing = await prisma.notification.findFirst({
            where: {
              userId: admin.id,
              title: { contains: contract.companyName },
              sentAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
            },
          });

          if (!existing) {
            await prisma.notification.create({
              data: {
                userId: admin.id,
                type: 'IN_APP',
                title: `Contract Expiring: ${contract.companyName}`,
                message: `Corporate contract with ${contract.companyName} expires on ${contract.contractEndDate?.toLocaleDateString()}. Follow up for renewal.`,
              },
            });
          }
        }
      }
    } catch (error) {
      logger.error('Corporate follow-up automation failed:', error);
    }
  }

  // Lead nurturing for incomplete registrations / intakes
  static async leadNurturing() {
    try {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

      // Find incomplete intakes
      const incompleteIntakes = await prisma.intakeResponse.findMany({
        where: {
          isCompleted: false,
          createdAt: { lte: threeDaysAgo },
          patientId: { not: null },
        },
        include: {
          patient: { include: { user: { include: { profile: true } } } },
        },
      });

      for (const intake of incompleteIntakes) {
        if (intake.patient?.user) {
          await prisma.notification.create({
            data: {
              userId: intake.patient.userId,
              type: 'IN_APP',
              title: 'Complete Your Assessment',
              message: 'You started a health assessment but didn\'t complete it. Complete it to get personalized recommendations.',
            },
          });
        }
      }
    } catch (error) {
      logger.error('Lead nurturing automation failed:', error);
    }
  }

  // Auto-generate blog content using AI
  static async autoGenerateContent() {
    try {
      const { ContentController } = await import('../controllers/content.controller');
      await ContentController.autoGenerateAndSave();
      logger.info('Auto-generated blog content successfully');
    } catch (error) {
      logger.error('Auto content generation failed:', error);
    }
  }
}
