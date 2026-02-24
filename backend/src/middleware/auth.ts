// ===========================================
// LIFELINK - Authentication Middleware
// ===========================================

import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';
import config from '../config';
import { AuthRequest, AuthPayload } from '../types';
import { AuthenticationError, AuthorizationError } from '../utils/errors';
import prisma from '../config/database';
import logger from '../config/logger';

// Verify JWT token
export const authenticate = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : req.cookies?.accessToken;

    if (!token) {
      throw new AuthenticationError('Access token required');
    }

    const decoded = jwt.verify(token, config.jwt.secret) as AuthPayload;

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true, isActive: true, lockedUntil: true },
    });

    if (!user || !user.isActive) {
      throw new AuthenticationError('Account is inactive or does not exist');
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new AuthenticationError('Account is temporarily locked');
    }

    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(new AuthenticationError('Token has expired'));
    } else if (error instanceof jwt.JsonWebTokenError) {
      next(new AuthenticationError('Invalid token'));
    } else {
      next(error);
    }
  }
};

// Role-based authorization
export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AuthenticationError('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.warn(
        `Authorization denied: User ${req.user.userId} with role ${req.user.role} attempted to access restricted resource`
      );
      return next(new AuthorizationError('Insufficient permissions'));
    }

    next();
  };
};

// Optional authentication (for public routes that can benefit from auth)
export const optionalAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : req.cookies?.accessToken;

    if (token) {
      const decoded = jwt.verify(token, config.jwt.secret) as AuthPayload;
      req.user = decoded;
    }
  } catch {
    // Token invalid or expired, continue without auth
  }
  next();
};
