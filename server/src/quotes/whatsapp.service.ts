import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class WhatsappService implements OnModuleInit {
  private logger = new Logger(WhatsappService.name);
  private isEnabled = false;
  private accessToken: string;
  private phoneNumberId: string;
  private apiVersion = 'v17.0'; // Or latest stable version
  private displayPhoneNumber: string | null = null;
  private verifiedName: string | null = null;
  private whatsappBusinessAccountId: string | null = null;

  constructor() {
    // Client will be initialized in onModuleInit
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  private getArray(value: unknown): unknown[] {
    return Array.isArray(value) ? value : [];
  }

  async onModuleInit() {
    this.accessToken = (process.env.META_ACCESS_TOKEN || process.env.WHATSAPP_TOKEN || '').trim();
    this.phoneNumberId = (process.env.META_PHONE_NUMBER_ID || process.env.WHATSAPP_PHONE_ID || '').trim();
    this.whatsappBusinessAccountId = (
      process.env.META_WHATSAPP_BUSINESS_ACCOUNT_ID ||
      process.env.WHATSAPP_BUSINESS_ACCOUNT_ID ||
      ''
    ).trim() || null;
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

    try {
      const url = `https://graph.facebook.com/${this.apiVersion}/${this.phoneNumberId}`;
      const response = await axios.get(url, {
        params: { fields: 'id,display_phone_number,verified_name' },
        headers: { 'Authorization': `Bearer ${this.accessToken}` },
      });
      this.displayPhoneNumber = response.data?.display_phone_number ?? null;
      this.verifiedName = response.data?.verified_name ?? null;
      this.logger.log(
        `WhatsApp Sender Loaded: ${this.displayPhoneNumber || 'unknown'} (${this.verifiedName || 'unknown'})`
      );

      if (this.whatsappBusinessAccountId) {
        this.logger.log(`WhatsApp WABA ID Configured: ${this.whatsappBusinessAccountId}`);
        try {
          const subscribeUrl = `https://graph.facebook.com/${this.apiVersion}/${this.whatsappBusinessAccountId}/subscribed_apps`;
          await axios.post(
            subscribeUrl,
            {},
            { headers: { 'Authorization': `Bearer ${this.accessToken}` } }
          );
          this.logger.log(`WhatsApp App subscribed to WABA webhooks: ${this.whatsappBusinessAccountId}`);
        } catch (subscribeError) {
          if (axios.isAxiosError(subscribeError)) {
            this.logger.error(
              `Failed to subscribe app to WABA webhooks: ${subscribeError.message}`,
              JSON.stringify(subscribeError.response?.data || {})
            );
          } else {
            this.logger.error('Failed to subscribe app to WABA webhooks', subscribeError as unknown);
          }
        }

        const templateName = (process.env.WHATSAPP_TEMPLATE_NAME || 'quote_notification').trim();
        if (templateName) {
          try {
            const templatesUrl = `https://graph.facebook.com/${this.apiVersion}/${this.whatsappBusinessAccountId}/message_templates`;
            const templatesResp = await axios.get(templatesUrl, {
              params: {
                name: templateName,
                fields: 'name,status,language,category,components',
                limit: 10,
              },
              headers: { 'Authorization': `Bearer ${this.accessToken}` },
            });
            const data: unknown[] =
              this.isRecord(templatesResp.data) && Array.isArray(templatesResp.data.data)
                ? (templatesResp.data.data as unknown[])
                : [];

            const match: Record<string, unknown> | null =
              (data.find((t) => this.isRecord(t) && t.name === templateName) as Record<string, unknown> | undefined) ||
              (this.isRecord(data[0]) ? (data[0] as Record<string, unknown>) : null);

            if (match) {
              const components = this.getArray(match.components);
              const bodyComponent =
                (components.find(
                  (c) => this.isRecord(c) && c.type === 'BODY'
                ) as Record<string, unknown> | undefined) || null;
              const bodyText = typeof bodyComponent?.text === 'string' ? bodyComponent.text : '';
              const variableCount = (bodyText.match(/\{\{\d+\}\}/g) || []).length;
              const status = typeof match.status === 'string' ? match.status : 'unknown';
              const language = typeof match.language === 'string' ? match.language : 'unknown';
              const category = typeof match.category === 'string' ? match.category : 'unknown';
              this.logger.log(
                `WhatsApp Template Loaded: ${templateName} status=${status} language=${language} category=${category} bodyVars=${variableCount}`
              );
            } else {
              this.logger.warn(`WhatsApp Template not found on WABA: ${templateName}`);
            }
          } catch (templateError) {
            if (axios.isAxiosError(templateError)) {
              this.logger.error(
                `Failed to load WhatsApp template definition: ${templateError.message}`,
                JSON.stringify(templateError.response?.data || {})
              );
            } else {
              this.logger.error('Failed to load WhatsApp template definition', templateError as unknown);
            }
          }
        }
      } else {
        this.logger.warn('WhatsApp WABA ID is not configured (META_WHATSAPP_BUSINESS_ACCOUNT_ID)');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        this.logger.error(
          `Failed to load WhatsApp sender info: ${error.message}`,
          JSON.stringify(error.response?.data || {})
        );
      } else {
        this.logger.error('Failed to load WhatsApp sender info', error as unknown);
      }
    }
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
      return {
        recipient,
        messageId,
        waId,
        sender: {
          phoneNumberId: this.phoneNumberId,
          displayPhoneNumber: this.displayPhoneNumber,
          verifiedName: this.verifiedName,
        },
        raw: response.data
      };
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
