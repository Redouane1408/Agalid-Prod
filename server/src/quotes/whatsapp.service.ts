import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Client, LocalAuth } from 'whatsapp-web.js';
import * as qrcode from 'qrcode-terminal';

@Injectable()
export class WhatsappService implements OnModuleInit {
  private client: Client;
  private logger = new Logger(WhatsappService.name);
  private isReady = false;

  constructor() {
    this.client = new Client({
      authStrategy: new LocalAuth(),
      puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      }
    });

    this.client.on('qr', (qr) => {
      this.logger.log('QR Code received. Please scan it with WhatsApp:');
      qrcode.generate(qr, { small: true });
    });

    this.client.on('ready', () => {
      this.logger.log('WhatsApp Client is ready!');
      this.isReady = true;
    });

    this.client.on('authenticated', () => {
      this.logger.log('WhatsApp Authenticated');
    });

    this.client.on('auth_failure', (msg) => {
      this.logger.error('WhatsApp Auth Failure', msg);
    });
  }

  onModuleInit() {
    this.logger.log('Initializing WhatsApp Client...');
    this.client.initialize().catch(err => {
        this.logger.error('Failed to initialize WhatsApp client', err);
    });
  }

  async sendMessage(to: string, message: string) {
    if (!this.isReady) {
      this.logger.warn('WhatsApp client is not ready yet. Please scan QR code in terminal.');
      throw new Error('WhatsApp client is not ready yet');
    }
    
    // Format number: remove '+' and spaces, ensure it ends with @c.us
    const sanitizedNumber = to.replace(/\D/g, '');
    const chatId = sanitizedNumber + '@c.us';
    
    try {
      await this.client.sendMessage(chatId, message);
      this.logger.log(`Message sent to ${chatId}`);
    } catch (error) {
      this.logger.error(`Failed to send message to ${chatId}`, error);
      throw error;
    }
  }
}
