// ===========================================
// LIFELINK - Auth Controller
// ===========================================

import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { AuthRequest } from '../types';
import { sendSuccess } from '../utils/response';

const authService = new AuthService();

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);

      // Set refresh token in httpOnly cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      sendSuccess(res, result, 'Registration successful', 201);
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(
        email,
        password,
        req.ip,
        req.headers['user-agent']
      );

      if (result.requires2FA) {
        return sendSuccess(res, { requires2FA: true, userId: result.userId }, 'Two-factor authentication required');
      }

      res.cookie('refreshToken', (result as any).refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      sendSuccess(res, result, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  static async verify2FA(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, token } = req.body;
      const result = await authService.verify2FA(userId, token);

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      sendSuccess(res, result, '2FA verified successfully');
    } catch (error) {
      next(error);
    }
  }

  static async setup2FA(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await authService.setup2FA(req.user!.userId);
      sendSuccess(res, result, '2FA setup initiated');
    } catch (error) {
      next(error);
    }
  }

  static async enable2FA(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { token } = req.body;
      const result = await authService.enable2FA(req.user!.userId, token);
      sendSuccess(res, result, '2FA enabled successfully');
    } catch (error) {
      next(error);
    }
  }

  static async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
      const result = await authService.refreshToken(refreshToken);

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      sendSuccess(res, result, 'Token refreshed');
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies?.refreshToken;
      await authService.logout(req.user!.userId, refreshToken);

      res.clearCookie('refreshToken');
      sendSuccess(res, null, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  }

  static async changePassword(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { currentPassword, newPassword } = req.body;
      await authService.changePassword(req.user!.userId, currentPassword, newPassword);
      sendSuccess(res, null, 'Password changed successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await (await import('../config/database')).default.user.findUnique({
        where: { id: req.user!.userId },
        include: { profile: true, patient: true, doctor: true },
      });
      sendSuccess(res, user, 'Profile retrieved');
    } catch (error) {
      next(error);
    }
  }
}
