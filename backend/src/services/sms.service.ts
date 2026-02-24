// ===========================================
// LIFELINK - SMS Service (Africa's Talking)
// ===========================================

import config from '../config';
import logger from '../config/logger';

export class SMSService {
  private apiKey: string;
  private username: string;
  private senderId: string;

  constructor() {
    this.apiKey = config.sms.apiKey;
    this.username = config.sms.username;
    this.senderId = config.sms.senderId;
  }

  async send(to: string, message: string): Promise<boolean> {
    try {
      // Format Kenyan phone number
      const formattedPhone = this.formatKenyanPhone(to);

      if (!this.apiKey || !this.username) {
        logger.warn('SMS service not configured. Message not sent:', { to, message });
        return false;
      }

      const response = await fetch('https://api.africastalking.com/version1/messaging', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
          'apiKey': this.apiKey,
        },
        body: new URLSearchParams({
          username: this.username,
          to: formattedPhone,
          message,
          from: this.senderId,
        }),
      });

      const result = await response.json();
      logger.info(`SMS sent to ${formattedPhone}:`, result);
      return true;
    } catch (error) {
      logger.error('SMS send failed:', error);
      return false;
    }
  }

  async sendAppointmentReminder(
    phone: string,
    data: { patientName: string; doctorName: string; date: string; time: string }
  ): Promise<boolean> {
    const message = `Hi ${data.patientName}, reminder: Your appointment with Dr. ${data.doctorName} is on ${data.date} at ${data.time}. LifeLink Mental Wellness Solution.`;
    return this.send(phone, message);
  }

  async sendAppointmentConfirmation(
    phone: string,
    data: { patientName: string; date: string; time: string }
  ): Promise<boolean> {
    const message = `Hi ${data.patientName}, your appointment on ${data.date} at ${data.time} has been confirmed. LifeLink Mental Wellness Solution.`;
    return this.send(phone, message);
  }

  async sendPaymentConfirmation(
    phone: string,
    data: { patientName: string; amount: number; currency: string }
  ): Promise<boolean> {
    const message = `Hi ${data.patientName}, payment of ${data.currency} ${data.amount.toLocaleString()} received. Thank you. LifeLink Mental Wellness Solution.`;
    return this.send(phone, message);
  }

  async sendCrisisAlert(
    phone: string,
    data: { patientName: string; riskLevel: string }
  ): Promise<boolean> {
    const message = `URGENT: Crisis alert for patient ${data.patientName}. Risk Level: ${data.riskLevel}. Immediate review required. LifeLink Crisis System.`;
    return this.send(phone, message);
  }

  private formatKenyanPhone(phone: string): string {
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '254' + cleaned.slice(1);
    }
    if (!cleaned.startsWith('254')) {
      cleaned = '254' + cleaned;
    }
    return '+' + cleaned;
  }
}
