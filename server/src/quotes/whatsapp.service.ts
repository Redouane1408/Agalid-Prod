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
    this.accessToken = (process.env.META_ACCESS_TOKEN || process.env.WHATSAPP_TOKEN || '').trim();
    this.phoneNumberId = (process.env.META_PHONE_NUMBER_ID || process.env.WHATSAPP_PHONE_ID || '').trim();
    const isExplicitlyDisabled = (process.env.WHATSAPP_ENABLED || '').trim().toLowerCase() === 'false';

    if (isExplicitlyDisabled) {
      this.logger.log('WhatsApp Client disabled by configuration');
      return;
    }

    if (!this.accessToken || !this.phoneNumberId) {
        this.logger.error('WhatsApp Meta credentials (ACCESS_TOKEN/PHONE_NUMBER_ID) missing');
        return;
    }

    this.isEnabled = true;
    this.logger.log('WhatsApp (Meta) Client Initialized');
  }

  private normalizeRecipient(to: string): string {
    let recipient = (to || '').replace(/\D/g, '');
    if (!recipient) {
      throw new Error('Invalid phone number');
    }

    if (recipient.startsWith('00')) {
      recipient = recipient.substring(2);
    }

    if (recipient.startsWith('0') && recipient.length === 10) {
      recipient = '213' + recipient.substring(1);
    } else if (recipient.length === 9) {
      recipient = '213' + recipient;
    }

    if (recipient.length < 10 || recipient.length > 15) {
      throw new Error('Invalid phone number');
    }

    return recipient;
  }

  async sendTemplate(to: string, templateName: string, languageCode: string, parameters: Array<Record<string, unknown>>) {
    if (!this.isEnabled) {
      this.logger.warn('WhatsApp service is disabled or not initialized.');
      throw new Error('WhatsApp service is disabled or not configured');
    }
    
    const recipient = this.normalizeRecipient(to);

    const url = `https://graph.facebook.com/${this.apiVersion}/${this.phoneNumberId}/messages`;
    
    this.logger.log(`Sending WhatsApp Template '${templateName}' to ${recipient} via Meta API`);
    
    try {
      const payload = {
        messaging_product: 'whatsapp',
        to: recipient,
        type: 'template',
        template: {
          name: templateName,
          language: { code: languageCode },
          components: [
            {
              type: 'body',
              parameters: parameters
            }
          ]
        }
      };

      const response = await axios.post(url, payload, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      const messageId = response.data?.messages?.[0]?.id ?? null;
      const waId = response.data?.contacts?.[0]?.wa_id ?? null;
      this.logger.log(`Template Message accepted by Meta. ID: ${messageId}`);
      return { recipient, messageId, waId, raw: response.data };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        this.logger.error(
          `Failed to send template to ${recipient}: ${error.message}`, 
          JSON.stringify(error.response?.data || {})
        );
      } else {
        this.logger.error(`Failed to send template to ${recipient}`, error);
      }
      throw error;
    }
  }

  async sendMessage(to: string, message: string) {
    if (!this.isEnabled) {
      this.logger.warn('WhatsApp service is disabled or not initialized.');
      // Don't throw error to avoid breaking the flow if WhatsApp is just disabled
      return; 
    }
    
    const recipient = this.normalizeRecipient(to);

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

      const messageId = response.data?.messages?.[0]?.id ?? null;
      this.logger.log(`Message accepted by Meta. ID: ${messageId}`);
      return { recipient, messageId, raw: response.data };
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
