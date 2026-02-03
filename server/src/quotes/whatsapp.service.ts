import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as Twilio from 'twilio';

@Injectable()
export class WhatsappService implements OnModuleInit {
  private client: Twilio.Twilio;
  private logger = new Logger(WhatsappService.name);
  private isEnabled = false;

  constructor() {
    // Client will be initialized in onModuleInit
  }

  onModuleInit() {
    if (process.env.WHATSAPP_ENABLED !== 'true') {
        this.logger.log('WhatsApp Client disabled (WHATSAPP_ENABLED != true)');
        return;
    }

    const accountSid = process.env.WHATSAPP_SID;
    const authToken = process.env.WHATSAPP_TOKEN;

    if (!accountSid || !authToken) {
        this.logger.error('WhatsApp credentials (SID/Token) missing');
        return;
    }

    try {
      this.client = Twilio(accountSid, authToken);
      this.isEnabled = true;
      this.logger.log('WhatsApp (Twilio) Client Initialized');
    } catch (error) {
      this.logger.error('Failed to initialize Twilio client', error);
    }
  }

  async sendMessage(to: string, message: string) {
    if (!this.isEnabled) {
      this.logger.warn('WhatsApp service is disabled or not initialized.');
      throw new Error('WhatsApp service disabled');
    }
    
    // Format number for Twilio: needs + prefix, no spaces
    // Assuming 'to' comes in various formats, sanitize it.
    // Twilio for WhatsApp usually requires "whatsapp:" prefix for sender and receiver
    const sanitizedNumber = to.replace(/\D/g, ''); // Remove non-digits
    if (!sanitizedNumber) {
        throw new Error('Invalid phone number');
    }

    const receiver = `whatsapp:+${sanitizedNumber}`;
    const sender = `whatsapp:${process.env.WHATSAPP_PHONE_NUMBER || '+14155238886'}`; // Use env or Twilio sandbox default

    this.logger.log(`Sending WhatsApp message to ${receiver} from ${sender}`);
    
    try {
      const response = await this.client.messages.create({
        body: message,
        from: sender,
        to: receiver
      });
      this.logger.log(`Message sent successfully. SID: ${response.sid}`);
      return response;
    } catch (error) {
      this.logger.error(`Failed to send message to ${receiver}`, error);
      throw error;
    }
  }
}
