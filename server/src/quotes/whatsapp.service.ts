import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class WhatsappService implements OnModuleInit {
  private logger = new Logger(WhatsappService.name);
  private isEnabled = false;
  private accessToken: string;
  private phoneNumberId: string;
  private apiVersion = 'v17.0'; // Or latest stable version

  constructor() {
    // Client will be initialized in onModuleInit
  }

  onModuleInit() {
    if (process.env.WHATSAPP_ENABLED !== 'true') {
        this.logger.log('WhatsApp Client disabled (WHATSAPP_ENABLED != true)');
        return;
    }

    this.accessToken = process.env.META_ACCESS_TOKEN || '';
    this.phoneNumberId = process.env.META_PHONE_NUMBER_ID || '';

    if (!this.accessToken || !this.phoneNumberId) {
        this.logger.error('WhatsApp Meta credentials (ACCESS_TOKEN/PHONE_NUMBER_ID) missing');
        // Do not enable if credentials are missing
        return;
    }

    this.isEnabled = true;
    this.logger.log('WhatsApp (Meta) Client Initialized');
  }

  async sendMessage(to: string, message: string) {
    if (!this.isEnabled) {
      this.logger.warn('WhatsApp service is disabled or not initialized.');
      // Don't throw error to avoid breaking the flow if WhatsApp is just disabled
      return; 
    }
    
    // Use the override number from ENV if available, otherwise use the 'to' parameter
    const recipient = process.env.WHATSAPP_PHONE_NUMBER 
      ? process.env.WHATSAPP_PHONE_NUMBER.replace(/\D/g, '')
      : to.replace(/\D/g, '');

    if (!recipient) {
        throw new Error('Invalid phone number');
    }

    const url = `https://graph.facebook.com/${this.apiVersion}/${this.phoneNumberId}/messages`;
    
    this.logger.log(`Sending WhatsApp message to ${recipient} via Meta API`);
    
    try {
      // Note: For business-initiated conversations, you MUST use a template.
      // If a user has messaged you within 24h, you can use text.
      // We will try sending 'text' type first as it's the direct replacement.
      // If this fails due to window restrictions, we'll need to implement templates.
      const payload = {
        messaging_product: 'whatsapp',
        to: recipient,
        type: 'text',
        text: { body: message }
      };

      const response = await axios.post(url, payload, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      this.logger.log(`Message sent successfully. ID: ${response.data.messages?.[0]?.id}`);
      return response.data;
    } catch (error) {
      // Log detailed Axios error
      if (axios.isAxiosError(error)) {
        this.logger.error(`Failed to send message to ${recipient}: ${error.message}`, error.response?.data);
      } else {
        this.logger.error(`Failed to send message to ${recipient}`, error);
      }
      // We do NOT throw here to prevent the main flow (e.g. creating a quote) from failing just because notification failed.
      // The quote service logs it but rethrows? 
      // Wait, in quotes.service.ts we decided to rethrow to show error to user?
      // If so, we should throw. But usually notification failure shouldn't rollback a DB transaction unless critical.
      // The user previously complained about "ok": true when it didn't work. So we should throw.
      throw error;
    }
  }
}
