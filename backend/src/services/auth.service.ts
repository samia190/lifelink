// ===========================================
// LIFELINK - Authentication Service
// ===========================================

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../config/database';
import config from '../config';
import logger from '../config/logger';
import { AuthPayload } from '../types';
import { AuthenticationError, ConflictError, NotFoundError } from '../utils/errors';
import { generatePatientNumber } from '../utils/encryption';
import { EmailService } from './email.service';

export class AuthService {
  private emailService: EmailService;

  constructor() {
    this.emailService = new EmailService();
  }

  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role?: string;
  }) {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 12);

    // Create user with profile
    const user = await prisma.user.create({
      data: {
        email: data.email,
        phone: data.phone,
        passwordHash,
        role: 'PATIENT',
        profile: {
          create: {
            firstName: data.firstName,
            lastName: data.lastName,
          },
        },
        patient: {
          create: {
            patientNumber: generatePatientNumber(),
          },
        },
      },
      include: {
        profile: true,
        patient: true,
      },
    });

    // Send verification email
    try {
      await this.emailService.sendWelcomeEmail(data.email, data.firstName);
    } catch (err) {
      logger.error('Failed to send welcome email:', err);
    }

    // Generate tokens
    const tokens = this.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Store refresh token
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'REGISTER',
        entity: 'User',
        entityId: user.id,
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.profile,
        patientNumber: user.patient?.patientNumber,
      },
      ...tokens,
    };
  }

  async login(email: string, password: string, ipAddress?: string, userAgent?: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new AuthenticationError(
        `Account locked. Try again after ${user.lockedUntil.toISOString()}`
      );
    }

    if (!user.isActive) {
      throw new AuthenticationError('Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      // Increment failed login count
      const failedCount = user.failedLoginCount + 1;
      const updateData: any = { failedLoginCount: failedCount };

      // Lock after 5 failed attempts for 30 minutes
      if (failedCount >= 5) {
        updateData.lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
        logger.warn(`Account locked due to failed login attempts: ${email}`);
      }

      await prisma.user.update({
        where: { id: user.id },
        data: updateData,
      });

      throw new AuthenticationError('Invalid email or password');
    }

    // Check if 2FA is enabled
    if (user.twoFactorEnabled) {
      return {
        requires2FA: true,
        userId: user.id,
      };
    }

    // Reset failed login count and update last login
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginCount: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
        lastLoginIp: ipAddress,
      },
    });

    // Generate tokens
    const tokens = this.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    await this.storeRefreshToken(user.id, tokens.refreshToken, userAgent, ipAddress);

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        entity: 'User',
        entityId: user.id,
        ipAddress,
        userAgent,
      },
    });

    return {
      requires2FA: false,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.profile,
      },
      ...tokens,
    };
  }

  async verify2FA(userId: string, token: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.twoFactorSecret) {
      throw new AuthenticationError('Invalid 2FA setup');
    }

    const isValid = authenticator.verify({
      token,
      secret: user.twoFactorSecret,
    });

    if (!isValid) {
      throw new AuthenticationError('Invalid 2FA code');
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        failedLoginCount: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
      },
    });

    const tokens = this.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async setup2FA(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError('User');

    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(
      user.email,
      config.twoFactor.appName,
      secret
    );
    const qrCode = await QRCode.toDataURL(otpauth);

    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: secret },
    });

    return { secret, qrCode };
  }

  async enable2FA(userId: string, token: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.twoFactorSecret) {
      throw new AuthenticationError('Setup 2FA first');
    }

    const isValid = authenticator.verify({
      token,
      secret: user.twoFactorSecret,
    });

    if (!isValid) {
      throw new AuthenticationError('Invalid verification code');
    }

    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: true },
    });

    return { enabled: true };
  }

  async refreshToken(refreshToken: string) {
    const session = await prisma.refreshSession.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      if (session) {
        await prisma.refreshSession.delete({ where: { id: session.id } });
      }
      throw new AuthenticationError('Invalid or expired refresh token');
    }

    const tokens = this.generateTokens({
      userId: session.user.id,
      email: session.user.email,
      role: session.user.role,
    });

    // Rotate refresh token
    await prisma.refreshSession.update({
      where: { id: session.id },
      data: {
        token: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return tokens;
  }

  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      await prisma.refreshSession.deleteMany({
        where: { userId, token: refreshToken },
      });
    } else {
      await prisma.refreshSession.deleteMany({ where: { userId } });
    }

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'LOGOUT',
        entity: 'User',
        entityId: userId,
      },
    });
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError('User');

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) throw new AuthenticationError('Current password is incorrect');

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    // Invalidate all refresh tokens
    await prisma.refreshSession.deleteMany({ where: { userId } });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'PASSWORD_CHANGE',
        entity: 'User',
        entityId: userId,
      },
    });
  }

  private generateTokens(payload: AuthPayload) {
    const accessToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiration as any,
    });

    const refreshToken = uuidv4();

    return { accessToken, refreshToken };
  }

  private async storeRefreshToken(
    userId: string,
    token: string,
    userAgent?: string,
    ipAddress?: string
  ) {
    await prisma.refreshSession.create({
      data: {
        userId,
        token,
        userAgent,
        ipAddress,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
  }
}
