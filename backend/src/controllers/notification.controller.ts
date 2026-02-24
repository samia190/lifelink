// ===========================================
// LIFELINK - Notification Controller
// ===========================================

import { Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../types';
import { sendSuccess, sendPaginated } from '../utils/response';

export class NotificationController {
  // Get my notifications
  static async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 20 } = req.query as any;
      const skip = (Number(page) - 1) * Number(limit);
      const userId = req.user!.userId;

      const [notifications, total, unreadCount] = await Promise.all([
        prisma.notification.findMany({
          where: { userId },
          skip,
          take: Number(limit),
          orderBy: { sentAt: 'desc' },
        }),
        prisma.notification.count({ where: { userId } }),
        prisma.notification.count({ where: { userId, isRead: false } }),
      ]);

      sendPaginated(res, notifications, total, Number(page), Number(limit), `${unreadCount} unread`);
    } catch (error) {
      next(error);
    }
  }

  // Get unread count
  static async unreadCount(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const count = await prisma.notification.count({
        where: { userId: req.user!.userId, isRead: false },
      });
      sendSuccess(res, { count });
    } catch (error) {
      next(error);
    }
  }

  // Mark as read
  static async markRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await prisma.notification.update({
        where: { id: req.params.id },
        data: { isRead: true, readAt: new Date() },
      });
      sendSuccess(res, null, 'Marked as read');
    } catch (error) {
      next(error);
    }
  }

  // Mark all as read
  static async markAllRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await prisma.notification.updateMany({
        where: { userId: req.user!.userId, isRead: false },
        data: { isRead: true, readAt: new Date() },
      });
      sendSuccess(res, null, 'All notifications marked as read');
    } catch (error) {
      next(error);
    }
  }
}
