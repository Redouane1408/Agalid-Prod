import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as nodemailer from 'nodemailer';
import { WhatsappService } from './whatsapp.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class QuotesService {
  private log(message: string, data?: unknown) {
    const logFile = path.join(process.cwd(), 'debug.log');
    const timestamp = new Date().toISOString();
    const line = `[${timestamp}] ${message} ${data ? JSON.stringify(data) : ''}\n`;
    console.log(line); // Also log to console for Docker logs
    try {
      fs.appendFileSync(logFile, line);
    } catch (err) {
      console.error('Failed to write to debug.log', err);
    }
  }

  constructor(
    private prisma: PrismaService,
    private whatsappService: WhatsappService
  ) {}

  private calculate(form: {
    monthlyConsumption: number;
    peakSunHours: number;
  }) {
    const systemEfficiency = 0.85;
    const panelWattage = 400;
    const systemCostPerKW = 1200;
    const dailyConsumption = form.monthlyConsumption / 30;
    const requiredDailyProduction = dailyConsumption / systemEfficiency;
    const requiredWattage = requiredDailyProduction / form.peakSunHours;
    const panelCount = Math.ceil(requiredWattage / panelWattage);
    const systemKW = (panelCount * panelWattage) / 1000;
    const systemCost = systemKW * systemCostPerKW;
    return { panelCount, systemKW, systemCost };
  }

  async createForRequest(requestId: number) {
    const req = await this.prisma.clientRequest.findUnique({ where: { id: requestId } });
    if (!req) throw new NotFoundException('Request not found');
    const calc = this.calculate({ monthlyConsumption: req.monthlyConsumption, peakSunHours: req.peakSunHours });
    return this.prisma.quote.create({
      data: {
        requestId: req.id,
        totalMad: Math.round(calc.systemCost),
        panelCount: calc.panelCount,
        systemKw: calc.systemKW,
        status: 'DRAFT',
      },
    });
  }

  async sendEmail(quoteId: number) {
    const quote = await this.prisma.quote.findUnique({
      where: { id: quoteId },
      include: { request: true },
    });
    if (!quote) {
      return;
    }
    const deliver = (process.env.SEND_DELIVERY || 'false').toLowerCase() === 'true';
    this.log('Sending email logic triggered', { deliver, quoteId });
    if (!deliver) {
      await this.prisma.quote.update({ where: { id: quoteId }, data: { status: 'SENT', sentAt: new Date() } });
      return;
    }

    const host = process.env.SMTP_HOST || 'localhost';
    const port = Number(process.env.SMTP_PORT || 1025);
    this.log('SMTP Config', { host, port });
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = process.env.EMAIL_FROM || 'info@agalid.com';
    try {
      const transport = user && pass
        ? nodemailer.createTransport({ host, port, auth: { user, pass } })
        : nodemailer.createTransport({ host, port, secure: false });
      
      this.log('Transport created. Sending mail...');
      const html = `
        <h2>Devis Agalid</h2>
        <p>Bonjour ${quote.request.name},</p>
        <p>Votre devis est prêt.</p>
        <ul>
          <li>Total estimé: ${quote.totalMad} MAD</li>
          <li>Panneaux: ${quote.panelCount}</li>
          <li>Puissance système: ${quote.systemKw} kW</li>
        </ul>
        <p>Merci,</p>
      `;
      await transport.sendMail({ to: quote.request.email, from, subject: 'Votre devis Agalid', html });
      this.log('Email sent successfully');
      await this.prisma.quote.update({ where: { id: quoteId }, data: { status: 'SENT', sentAt: new Date() } });
    } catch (e: unknown) {
      if (e instanceof Error) {
        this.log('Email send failed', { message: e.message, stack: e.stack });
      } else {
        this.log('Email send failed', { error: e });
      }
      // Do NOT mark as SENT if it failed
      throw e; // Rethrow to let the controller handle it (or at least fail the request)
    }
  }

  async sendWhatsApp(quoteId: number) {
    const quote = await this.prisma.quote.findUnique({
      where: { id: quoteId },
      include: { request: true },
    });
    if (!quote) return;

    const deliver = (process.env.SEND_DELIVERY || 'false').toLowerCase() === 'true';
    this.log('Sending WhatsApp logic triggered', { deliver, quoteId });

    if (!deliver) {
      await this.prisma.quote.update({ where: { id: quoteId }, data: { status: 'SENT', sentAt: new Date() } });
      return;
    }

    const to = quote.request.phone;
    const text = `Bonjour ${quote.request.name},\n\nVotre devis Agalid est prêt.\nTotal: ${quote.totalMad} MAD\nPanneaux: ${quote.panelCount}\nPuissance: ${quote.systemKw} kW\n\nMerci de votre confiance.`;
    
    try {
      this.log('Sending WhatsApp message via WhatsappService...');
      await this.whatsappService.sendMessage(to, text);
      
      this.log('WhatsApp sent successfully');
      await this.prisma.quote.update({ where: { id: quoteId }, data: { status: 'SENT', sentAt: new Date() } });
    } catch (e: unknown) {
      if (e instanceof Error) {
        this.log('WhatsApp send failed', { message: e.message });
      } else {
        this.log('WhatsApp send failed', { error: e });
      }
      // Do NOT mark as SENT if it failed
      throw e;
    }
  }
}
