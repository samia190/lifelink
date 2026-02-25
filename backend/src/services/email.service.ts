// ===========================================
// LIFELINK - Email Service
// ===========================================

import nodemailer from 'nodemailer';
import config from '../config';
import logger from '../config/logger';

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.port === 465,
      auth: {
        user: config.email.user,
        pass: config.email.pass,
      },
    });
  }

  private async send(to: string, subject: string, html: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `"${config.email.fromName}" <${config.email.from}>`,
        to,
        subject,
        html: this.wrapInTemplate(subject, html),
      });
      logger.info(`Email sent to ${to}: ${subject}`);
    } catch (error) {
      logger.error(`Failed to send email to ${to}:`, error);
      throw error;
    }
  }

  async sendWelcomeEmail(to: string, name: string): Promise<void> {
    const html = `
      <h2>Welcome to LifeLink Mental Wellness Solution</h2>
      <p>Dear ${name},</p>
      <p>Thank you for registering with LifeLink Mental Wellness Solution. We are committed to providing you with the highest quality mental and medical healthcare services.</p>
      <p>Your account has been created successfully. You can now:</p>
      <ul>
        <li>Book appointments with our specialists</li>
        <li>Access our telehealth services</li>
        <li>Use our AI-powered mental health tools</li>
        <li>Access your secure patient portal</li>
      </ul>
      <p>If you need immediate help, please don't hesitate to contact us.</p>
      <p><strong>Crisis Hotline:</strong> ${config.crisis.hotline}</p>
      <p>Warm regards,<br>The LifeLink Team</p>
    `;
    await this.send(to, 'Welcome to LifeLink Mental Wellness Solution', html);
  }

  async sendAppointmentConfirmation(
    to: string,
    data: {
      patientName: string;
      doctorName: string;
      date: string;
      time: string;
      type: string;
      location?: string;
    }
  ): Promise<void> {
    const html = `
      <h2>Appointment Confirmed</h2>
      <p>Dear ${data.patientName},</p>
      <p>Your appointment has been confirmed:</p>
      <table style="border-collapse:collapse;width:100%;max-width:400px;">
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Doctor</td><td style="padding:8px;border:1px solid #ddd;">${data.doctorName}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Date</td><td style="padding:8px;border:1px solid #ddd;">${data.date}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Time</td><td style="padding:8px;border:1px solid #ddd;">${data.time}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Type</td><td style="padding:8px;border:1px solid #ddd;">${data.type}</td></tr>
        ${data.location ? `<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Location</td><td style="padding:8px;border:1px solid #ddd;">${data.location}</td></tr>` : ''}
      </table>
      <p>Please arrive 10 minutes early. If you need to reschedule, please do so at least 24 hours before your appointment.</p>
      <p>Warm regards,<br>LifeLink Team</p>
    `;
    await this.send(to, 'Appointment Confirmed - LifeLink', html);
  }

  async sendAppointmentReminder(
    to: string,
    data: { patientName: string; doctorName: string; date: string; time: string; type: string }
  ): Promise<void> {
    const html = `
      <h2>Appointment Reminder</h2>
      <p>Dear ${data.patientName},</p>
      <p>This is a friendly reminder of your upcoming appointment:</p>
      <p><strong>Doctor:</strong> ${data.doctorName}<br>
      <strong>Date:</strong> ${data.date}<br>
      <strong>Time:</strong> ${data.time}<br>
      <strong>Type:</strong> ${data.type}</p>
      <p>We look forward to seeing you.</p>
      <p>Warm regards,<br>LifeLink Team</p>
    `;
    await this.send(to, 'Appointment Reminder - LifeLink', html);
  }

  async sendPaymentReceipt(
    to: string,
    data: {
      patientName: string;
      amount: number;
      currency: string;
      method: string;
      transactionId: string;
      date: string;
      description: string;
    }
  ): Promise<void> {
    const html = `
      <h2>Payment Receipt</h2>
      <p>Dear ${data.patientName},</p>
      <p>We have received your payment. Details below:</p>
      <table style="border-collapse:collapse;width:100%;max-width:400px;">
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Amount</td><td style="padding:8px;border:1px solid #ddd;">${data.currency} ${data.amount.toLocaleString()}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Method</td><td style="padding:8px;border:1px solid #ddd;">${data.method}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Transaction ID</td><td style="padding:8px;border:1px solid #ddd;">${data.transactionId}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Date</td><td style="padding:8px;border:1px solid #ddd;">${data.date}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Description</td><td style="padding:8px;border:1px solid #ddd;">${data.description}</td></tr>
      </table>
      <p>Thank you for your payment.</p>
      <p>Warm regards,<br>LifeLink Team</p>
    `;
    await this.send(to, 'Payment Receipt - LifeLink', html);
  }

  async sendCrisisAlert(
    to: string,
    data: { patientName: string; patientId: string; riskLevel: string; description: string }
  ): Promise<void> {
    const html = `
      <h2 style="color:#e53e3e;">⚠️ CRISIS ALERT</h2>
      <p><strong>Patient:</strong> ${data.patientName} (${data.patientId})</p>
      <p><strong>Risk Level:</strong> <span style="color:#e53e3e;font-weight:bold;">${data.riskLevel}</span></p>
      <p><strong>Description:</strong> ${data.description}</p>
      <p>Immediate action required. Please review the patient's profile and contact them urgently.</p>
      <p><em>This is an automated alert from the LifeLink Crisis Management System.</em></p>
    `;
    await this.send(to, `🚨 CRISIS ALERT: ${data.patientName} - ${data.riskLevel}`, html);
  }

  async sendPasswordReset(to: string, name: string, resetLink: string): Promise<void> {
    const html = `
      <h2>Password Reset Request</h2>
      <p>Dear ${name},</p>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <p><a href="${resetLink}" style="display:inline-block;padding:12px 24px;background:#1a365d;color:#fff;text-decoration:none;border-radius:6px;">Reset Password</a></p>
      <p>This link expires in 1 hour. If you did not request this, please ignore this email.</p>
      <p>Warm regards,<br>LifeLink Team</p>
    `;
    await this.send(to, 'Password Reset - LifeLink', html);
  }

  async sendDoctorCredentials(to: string, name: string, password: string): Promise<void> {
    const html = `
      <h2>Welcome to the LifeLink Clinical Team</h2>
      <p>Dear Dr. ${name},</p>
      <p>Your LifeLink practitioner account has been created. You can now access your doctor dashboard to manage appointments, view patient records, and conduct telehealth sessions.</p>
      <h3>Your Login Credentials</h3>
      <table style="border-collapse:collapse;width:100%;max-width:400px;">
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Email</td><td style="padding:8px;border:1px solid #ddd;">${to}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Password</td><td style="padding:8px;border:1px solid #ddd;font-family:monospace;font-size:16px;color:#1a365d;font-weight:bold;">${password}</td></tr>
      </table>
      <p style="margin-top:16px;"><strong>Important:</strong> Please change your password after your first login for security.</p>
      <p><a href="${config.app.url}/login" style="display:inline-block;padding:12px 24px;background:linear-gradient(135deg,#d4af37,#c5a028);color:#1a365d;text-decoration:none;border-radius:6px;font-weight:bold;">Login to Dashboard</a></p>
      <p>If you have any questions, contact the admin team.</p>
      <p>Warm regards,<br>LifeLink Team</p>
    `;
    await this.send(to, 'Your LifeLink Doctor Account - Login Credentials', html);
  }

  private wrapInTemplate(title: string, content: string): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
    </head>
    <body style="margin:0;padding:0;background-color:#f7fafc;font-family:'Helvetica Neue',Arial,sans-serif;">
      <div style="max-width:600px;margin:0 auto;background:#ffffff;">
        <div style="background:linear-gradient(135deg,#1a365d 0%,#2d3748 100%);padding:24px;text-align:center;">
          <h1 style="color:#d4af37;margin:0;font-size:24px;letter-spacing:2px;">LIFELINK</h1>
          <p style="color:#e2e8f0;margin:4px 0 0;font-size:12px;letter-spacing:1px;">MENTAL WELLNESS SOLUTION</p>
        </div>
        <div style="padding:32px 24px;">
          ${content}
        </div>
        <div style="background:#f7fafc;padding:24px;text-align:center;border-top:1px solid #e2e8f0;">
          <p style="margin:0;color:#718096;font-size:12px;">LifeLink Mental Wellness Solution, Nairobi, Kenya</p>
          <p style="margin:4px 0 0;color:#718096;font-size:12px;">Crisis Hotline: ${config.crisis.hotline}</p>
          <p style="margin:8px 0 0;color:#a0aec0;font-size:11px;">This is an automated message. Please do not reply directly.</p>
        </div>
      </div>
    </body>
    </html>`;
  }
}
