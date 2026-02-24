// ===========================================
// LIFELINK - M-Pesa Payment Service
// ===========================================

import config from '../config';
import logger from '../config/logger';
import prisma from '../config/database';

export class MpesaService {
  private consumerKey: string;
  private consumerSecret: string;
  private shortcode: string;
  private passkey: string;
  private callbackUrl: string;
  private baseUrl: string;

  constructor() {
    this.consumerKey = config.mpesa.consumerKey;
    this.consumerSecret = config.mpesa.consumerSecret;
    this.shortcode = config.mpesa.shortcode;
    this.passkey = config.mpesa.passkey;
    this.callbackUrl = config.mpesa.callbackUrl;
    this.baseUrl =
      config.mpesa.environment === 'production'
        ? 'https://api.safaricom.co.ke'
        : 'https://sandbox.safaricom.co.ke';
  }

  // Get OAuth token from Safaricom
  private async getAccessToken(): Promise<string> {
    const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');

    const response = await fetch(`${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
      method: 'GET',
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });

    const data: any = await response.json();
    return data.access_token;
  }

  // Generate timestamp for STK push
  private getTimestamp(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  }

  // Generate password for STK push
  private getPassword(timestamp: string): string {
    return Buffer.from(`${this.shortcode}${this.passkey}${timestamp}`).toString('base64');
  }

  // Initiate STK Push (Lipa Na M-Pesa Online)
  async initiateSTKPush(data: {
    phoneNumber: string;
    amount: number;
    appointmentId?: string;
    description?: string;
  }): Promise<{
    success: boolean;
    checkoutRequestId?: string;
    merchantRequestId?: string;
    message: string;
  }> {
    try {
      const accessToken = await this.getAccessToken();
      const timestamp = this.getTimestamp();
      const password = this.getPassword(timestamp);

      // Format phone number
      let phone = data.phoneNumber.replace(/\D/g, '');
      if (phone.startsWith('0')) phone = '254' + phone.slice(1);
      if (!phone.startsWith('254')) phone = '254' + phone;

      const payload = {
        BusinessShortCode: this.shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.ceil(data.amount),
        PartyA: phone,
        PartyB: this.shortcode,
        PhoneNumber: phone,
        CallBackURL: this.callbackUrl,
        AccountReference: data.appointmentId || 'LifeLink',
        TransactionDesc: data.description || 'LifeLink Medical Payment',
      };

      const response = await fetch(`${this.baseUrl}/mpesa/stkpush/v1/processrequest`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result: any = await response.json();

      if (result.ResponseCode === '0') {
        // Create pending payment record
        await prisma.payment.create({
          data: {
            appointmentId: data.appointmentId || null,
            amount: data.amount,
            currency: 'KES',
            method: 'MPESA',
            status: 'PENDING',
            transactionId: result.CheckoutRequestID,
            mpesaPhoneNumber: phone,
            description: data.description,
            metadata: result as any,
          },
        });

        return {
          success: true,
          checkoutRequestId: result.CheckoutRequestID,
          merchantRequestId: result.MerchantRequestID,
          message: 'STK push sent. Please enter your M-Pesa PIN.',
        };
      }

      return {
        success: false,
        message: result.errorMessage || 'Failed to initiate M-Pesa payment',
      };
    } catch (error) {
      logger.error('M-Pesa STK push error:', error);
      return {
        success: false,
        message: 'M-Pesa service temporarily unavailable',
      };
    }
  }

  // Process M-Pesa callback
  async processCallback(callbackData: any): Promise<void> {
    try {
      const { Body } = callbackData;
      const { stkCallback } = Body;
      const { ResultCode, ResultDesc, CheckoutRequestID, CallbackMetadata } = stkCallback;

      const payment = await prisma.payment.findFirst({
        where: { transactionId: CheckoutRequestID },
      });

      if (!payment) {
        logger.warn(`Payment not found for checkout: ${CheckoutRequestID}`);
        return;
      }

      if (ResultCode === 0) {
        // Payment successful
        const metadata: Record<string, string | number> = {};
        if (CallbackMetadata?.Item) {
          CallbackMetadata.Item.forEach((item: { Name: string; Value: string | number }) => {
            metadata[item.Name] = item.Value;
          });
        }

        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'COMPLETED',
            mpesaReceiptNumber: String(metadata['MpesaReceiptNumber'] || ''),
            paidAt: new Date(),
            metadata: { ...((payment.metadata as object) || {}), callback: metadata },
          },
        });

        // Update appointment as paid if linked
        if (payment.appointmentId) {
          await prisma.appointment.update({
            where: { id: payment.appointmentId },
            data: { isPaid: true },
          });
        }

        logger.info(`M-Pesa payment completed: ${metadata['MpesaReceiptNumber']}`);
      } else {
        // Payment failed
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'FAILED',
            metadata: { ...((payment.metadata as object) || {}), error: ResultDesc },
          },
        });

        logger.warn(`M-Pesa payment failed: ${ResultDesc}`);
      }
    } catch (error) {
      logger.error('M-Pesa callback processing error:', error);
    }
  }

  // Query transaction status
  async queryStatus(checkoutRequestId: string): Promise<any> {
    try {
      const accessToken = await this.getAccessToken();
      const timestamp = this.getTimestamp();
      const password = this.getPassword(timestamp);

      const response = await fetch(`${this.baseUrl}/mpesa/stkpushquery/v1/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          BusinessShortCode: this.shortcode,
          Password: password,
          Timestamp: timestamp,
          CheckoutRequestID: checkoutRequestId,
        }),
      });

      return response.json();
    } catch (error) {
      logger.error('M-Pesa status query error:', error);
      throw error;
    }
  }
}
