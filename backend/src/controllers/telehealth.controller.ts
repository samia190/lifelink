// ===========================================
// LIFELINK - Telehealth Controller
// ===========================================

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { sendSuccess } from '../utils/response';
import { NotFoundError, AppError } from '../utils/errors';
import { TelehealthService } from '../services/telehealth.service';

const telehealthService = new TelehealthService();

export class TelehealthController {
  // Get session info & token
  static async joinSession(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { roomId } = req.params;
      const session = await telehealthService.getSession(roomId);

      if (!session) throw new NotFoundError('Telehealth session');

      const role = ['DOCTOR', 'PSYCHIATRIST', 'THERAPIST'].includes(req.user!.role) ? 'doctor' : 'patient';
      const identity = `${req.user!.role}-${req.user!.userId}`;

      const token = await telehealthService.generateToken(roomId, identity, role);
      if (!token) throw new AppError('Failed to generate video token', 500);

      sendSuccess(res, {
        token,
        roomId,
        session,
        role,
      });
    } catch (error) {
      next(error);
    }
  }

  // Start session
  static async startSession(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { roomId } = req.params;
      await telehealthService.startSession(roomId);
      sendSuccess(res, null, 'Session started');
    } catch (error) {
      next(error);
    }
  }

  // End session
  static async endSession(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { roomId } = req.params;
      await telehealthService.endSession(roomId);
      sendSuccess(res, null, 'Session ended');
    } catch (error) {
      next(error);
    }
  }

  // Enable recording
  static async enableRecording(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { roomId } = req.params;
      const { consent } = req.body;
      await telehealthService.enableRecording(roomId, consent);
      sendSuccess(res, null, consent ? 'Recording enabled' : 'Recording requires consent');
    } catch (error) {
      next(error);
    }
  }

  // Webhook for room events
  static async webhook(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // Handle Twilio video room events
      const { StatusCallbackEvent, RoomName } = req.body;

      if (StatusCallbackEvent === 'room-ended') {
        await telehealthService.endSession(RoomName);
      }

      res.status(200).send();
    } catch (error) {
      next(error);
    }
  }
}
