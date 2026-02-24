// ===========================================
// LIFELINK - Chat Controller (AI + Crisis)
// ===========================================

import { Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../config/database';
import { AuthRequest } from '../types';
import { sendSuccess } from '../utils/response';
import { AIService } from '../services/ai.service';
import { EmailService } from '../services/email.service';
import config from '../config';
import logger from '../config/logger';

const aiService = new AIService();
const emailService = new EmailService();

export class ChatController {
  // Send message to AI chat
  static async sendMessage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { message, conversationId } = req.body;
      let convId = conversationId;

      // Get or create conversation
      if (!convId) {
        const conv = await prisma.chatConversation.create({
          data: {
            sessionId: uuidv4(),
            userId: req.user?.userId,
            isAnonymous: !req.user,
          },
        });
        convId = conv.id;
      }

      // Store user message
      await prisma.chatMessage.create({
        data: {
          conversationId: convId,
          userId: req.user?.userId,
          role: 'user',
          content: message,
        },
      });

      // Get conversation history
      const history = await prisma.chatMessage.findMany({
        where: { conversationId: convId },
        orderBy: { createdAt: 'asc' },
        take: 20,
      });

      const messages = history.map((m) => ({
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content,
      }));

      // Get AI response
      const aiResult = await aiService.chat(messages, convId);

      // Check for crisis
      const crisisDetected = aiResult.riskFlags.length > 0;

      // Store AI response
      await prisma.chatMessage.create({
        data: {
          conversationId: convId,
          role: 'assistant',
          content: aiResult.response,
          sentimentScore: aiResult.sentiment,
          riskFlags: aiResult.riskFlags,
        },
      });

      // Handle crisis detection
      if (crisisDetected && req.user?.userId) {
        await ChatController.handleCrisis(req.user.userId, aiResult.riskFlags, message);
      }

      sendSuccess(res, {
        conversationId: convId,
        response: aiResult.response,
        crisisDetected,
        crisisResources: crisisDetected
          ? {
              hotline: config.crisis.hotline,
              emergency: config.crisis.emergencyNumber,
              message: 'If you are in immediate danger, please call emergency services.',
            }
          : undefined,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get conversation history
  static async getConversation(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const conversation = await prisma.chatConversation.findUnique({
        where: { id: req.params.id },
        include: {
          messages: { orderBy: { createdAt: 'asc' } },
        },
      });

      sendSuccess(res, conversation);
    } catch (error) {
      next(error);
    }
  }

  // Submit intake form
  static async submitIntake(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { responses } = req.body;

      // Get patient if authenticated
      let patientId: string | undefined;
      if (req.user) {
        const patient = await prisma.patient.findFirst({ where: { userId: req.user.userId } });
        patientId = patient?.id;
      }

      // AI recommendation based on intake
      const recommendation = await aiService.getServiceRecommendation(responses);

      // Calculate risk score from intake
      const intakeText = Object.values(responses).join(' ');
      const riskFlags = aiService.detectCrisisKeywords(intakeText as string);
      let riskScore = 0;
      let riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'LOW';

      if (riskFlags.length >= 3) {
        riskScore = 80;
        riskLevel = 'CRITICAL';
      } else if (riskFlags.length >= 2) {
        riskScore = 60;
        riskLevel = 'HIGH';
      } else if (riskFlags.length >= 1) {
        riskScore = 40;
        riskLevel = 'MODERATE';
      }

      const intake = await prisma.intakeResponse.create({
        data: {
          patientId,
          sessionId: uuidv4(),
          responses,
          riskScore,
          riskLevel,
          aiSummary: recommendation.summary,
          recommendations: recommendation.recommendations,
          isCompleted: true,
          completedAt: new Date(),
        },
      });

      // Update patient risk if applicable
      if (patientId && (riskLevel === 'HIGH' || riskLevel === 'CRITICAL')) {
        await prisma.patient.update({
          where: { id: patientId },
          data: { riskLevel, riskScore, lastRiskAssessment: new Date() },
        });
      }

      sendSuccess(res, {
        intake,
        recommendation,
        crisisResources:
          riskLevel === 'HIGH' || riskLevel === 'CRITICAL'
            ? {
                hotline: config.crisis.hotline,
                emergency: config.crisis.emergencyNumber,
              }
            : undefined,
      }, 'Intake submitted successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  // Handle crisis detection
  private static async handleCrisis(userId: string, riskFlags: string[], message: string) {
    try {
      const patient = await prisma.patient.findFirst({
        where: { userId },
        include: { user: { include: { profile: true } } },
      });

      if (!patient) return;

      // Create risk alert
      await prisma.riskAlert.create({
        data: {
          patientId: patient.id,
          alertType: 'SUICIDE_RISK',
          riskLevel: 'CRITICAL',
          description: `Crisis keywords detected in chat: ${riskFlags.join(', ')}`,
          triggerSource: 'chat',
          triggerData: { message: message.substring(0, 500), riskFlags },
        },
      });

      // Update patient risk level
      await prisma.patient.update({
        where: { id: patient.id },
        data: { riskLevel: 'CRITICAL', riskScore: 90, lastRiskAssessment: new Date() },
      });

      // Alert admins
      const admins = await prisma.user.findMany({
        where: { role: 'SUPER_ADMIN', isActive: true },
      });

      for (const admin of admins) {
        await emailService.sendCrisisAlert(admin.email, {
          patientName: `${patient.user.profile?.firstName} ${patient.user.profile?.lastName}`,
          patientId: patient.patientNumber,
          riskLevel: 'CRITICAL',
          description: `Crisis keywords detected: ${riskFlags.join(', ')}`,
        });
      }

      // Create in-app notification for admins
      await prisma.notification.createMany({
        data: admins.map((admin) => ({
          userId: admin.id,
          type: 'IN_APP' as const,
          title: '🚨 Crisis Alert',
          message: `Patient ${patient.patientNumber} has triggered a crisis alert. Immediate review required.`,
          data: { patientId: patient.id, riskFlags },
        })),
      });

      logger.warn(`CRISIS ALERT: Patient ${patient.patientNumber} - Flags: ${riskFlags.join(', ')}`);
    } catch (error) {
      logger.error('Crisis handling error:', error);
    }
  }
}
