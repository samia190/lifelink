// ===========================================
// LIFELINK - Telehealth / Video Service
// ===========================================

import Twilio from 'twilio';
import config from '../config';
import logger from '../config/logger';
import prisma from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export class TelehealthService {
  private twilioClient: Twilio.Twilio | null = null;

  constructor() {
    if (config.twilio.accountSid && config.twilio.authToken && config.twilio.accountSid.startsWith('AC')) {
      this.twilioClient = Twilio(config.twilio.accountSid, config.twilio.authToken);
    } else {
      logger.warn('Twilio credentials not configured - telehealth features disabled');
    }
  }

  // Create a video room for a telehealth session
  async createRoom(appointmentId: string): Promise<{
    roomId: string;
    roomName: string;
    success: boolean;
  }> {
    const roomName = `lifelink-${appointmentId}-${uuidv4().slice(0, 8)}`;

    try {
      if (this.twilioClient) {
        await this.twilioClient.video.v1.rooms.create({
          uniqueName: roomName,
          type: 'group-small',
          maxParticipants: 4,
          recordParticipantsOnConnect: false,
          statusCallback: `${config.app.apiUrl}/api/telehealth/webhook`,
        });
      }

      // Create telehealth session record
      const session = await prisma.telehealthSession.create({
        data: {
          appointmentId,
          doctorId: (await prisma.appointment.findUnique({
            where: { id: appointmentId },
            select: { doctorId: true },
          }))!.doctorId,
          roomId: roomName,
          status: 'SCHEDULED',
        },
      });

      return { roomId: session.roomId, roomName, success: true };
    } catch (error) {
      logger.error('Failed to create telehealth room:', error);
      return { roomId: '', roomName: '', success: false };
    }
  }

  // Generate access token for a participant
  async generateToken(
    roomName: string,
    identity: string,
    role: 'doctor' | 'patient'
  ): Promise<string | null> {
    try {
      if (!config.twilio.apiKey || !config.twilio.apiSecret) {
        // Return a placeholder for development
        logger.warn('Twilio API keys not configured');
        return `dev-token-${identity}-${roomName}`;
      }

      const { AccessToken } = Twilio.jwt;
      const { VideoGrant } = AccessToken;

      const token = new AccessToken(
        config.twilio.accountSid,
        config.twilio.apiKey,
        config.twilio.apiSecret,
        { identity }
      );

      const videoGrant = new VideoGrant({ room: roomName });
      token.addGrant(videoGrant);

      return token.toJwt();
    } catch (error) {
      logger.error('Failed to generate telehealth token:', error);
      return null;
    }
  }

  // Start a session
  async startSession(roomId: string): Promise<void> {
    await prisma.telehealthSession.update({
      where: { roomId },
      data: { status: 'ACTIVE', startedAt: new Date() },
    });
  }

  // End a session
  async endSession(roomId: string): Promise<void> {
    const session = await prisma.telehealthSession.findUnique({ where: { roomId } });
    if (!session) return;

    const duration = session.startedAt
      ? Math.round((Date.now() - session.startedAt.getTime()) / 60000)
      : 0;

    await prisma.telehealthSession.update({
      where: { roomId },
      data: {
        status: 'COMPLETED',
        endedAt: new Date(),
        duration,
      },
    });

    // Complete the appointment
    await prisma.appointment.update({
      where: { id: session.appointmentId },
      data: { status: 'COMPLETED', completedAt: new Date() },
    });

    // Close Twilio room
    if (this.twilioClient) {
      try {
        await this.twilioClient.video.v1.rooms(roomId).update({ status: 'completed' });
      } catch (error) {
        logger.error('Failed to close Twilio room:', error);
      }
    }
  }

  // Enable recording
  async enableRecording(roomId: string, consent: boolean): Promise<void> {
    if (!consent) return;

    await prisma.telehealthSession.update({
      where: { roomId },
      data: { isRecorded: true, recordingConsent: consent },
    });
  }

  // Get session details
  async getSession(roomId: string) {
    return prisma.telehealthSession.findUnique({
      where: { roomId },
      include: {
        appointment: {
          include: {
            patient: { include: { user: { include: { profile: true } } } },
            doctor: { include: { user: { include: { profile: true } } } },
          },
        },
      },
    });
  }
}
