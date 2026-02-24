// ===========================================
// LIFELINK - Audit Logger Middleware
// ===========================================

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import prisma from '../config/database';
import logger from '../config/logger';

export const auditLog = (action: string, entity: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    // Store original json method to capture response
    const originalJson = res.json.bind(res);

    res.json = (body: unknown) => {
      // Log audit entry after response
      const logEntry = {
        userId: req.user?.userId,
        action,
        entity,
        entityId: req.params.id || undefined,
        ipAddress: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
        metadata: {
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
        },
      };

      prisma.auditLog
        .create({ data: logEntry })
        .catch((err) => logger.error('Audit log failed:', err));

      return originalJson(body);
    };

    next();
  };
};
