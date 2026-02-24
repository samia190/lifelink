// ===========================================
// LIFELINK - Error Handler Middleware
// ===========================================

import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../utils/errors';
import logger from '../config/logger';
import config from '../config';
import prisma from '../config/database';

export const errorHandler = async (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> => {
  // Log error
  logger.error(`${err.message}`, {
    error: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
  });

  // Log to database in production
  if (config.app.isProduction) {
    try {
      await prisma.systemLog.create({
        data: {
          level: 'error',
          source: `${req.method} ${req.path}`,
          message: err.message,
          stackTrace: err.stack,
          metadata: {
            ip: req.ip,
            userAgent: req.headers['user-agent'],
          },
        },
      });
    } catch {
      logger.error('Failed to log error to database');
    }
  }

  if (err instanceof ValidationError) {
    res.status(422).json({
      success: false,
      message: err.message,
      code: err.code,
      errors: err.errors,
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
    });
    return;
  }

  // Unknown errors
  res.status(500).json({
    success: false,
    message: config.app.isProduction
      ? 'An unexpected error occurred'
      : err.message,
    code: 'INTERNAL_ERROR',
    ...(config.app.isProduction ? {} : { stack: err.stack }),
  });
};

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
    code: 'NOT_FOUND',
  });
};
