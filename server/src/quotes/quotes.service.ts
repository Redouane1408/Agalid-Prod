import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import nodemailer from 'nodemailer';
import axios from 'axios';

@Injectable()
export class QuotesService {
  constructor(private prisma: PrismaService) {}

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
    if (!quote) throw new NotFoundException('Quote not found');

    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = process.env.EMAIL_FROM || 'no-reply@agalid.com';
    if (!host) throw new Error('SMTP host missing');
    const transport = user && pass
      ? nodemailer.createTransport({ host, port, auth: { user, pass } })
      : nodemailer.createTransport({ host, port, secure: false });
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
    await this.prisma.quote.update({ where: { id: quoteId }, data: { status: 'SENT', sentAt: new Date() } });
  }

  async sendWhatsApp(quoteId: number) {
    const quote = await this.prisma.quote.findUnique({
      where: { id: quoteId },
      include: { request: true },
    });
    if (!quote) throw new NotFoundException('Quote not found');

    const token = process.env.WHATSAPP_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_ID;
    if (!token || !phoneId) {
      await this.prisma.quote.update({ where: { id: quoteId }, data: { status: 'SENT', sentAt: new Date() } });
      return;
    }
    const to = quote.request.phone.replace(/\s+/g, '');

    const text = `Devis Agalid\nTotal: ${quote.totalMad} MAD\nPanneaux: ${quote.panelCount}\nPuissance: ${quote.systemKw} kW`;
    await axios.post(`https://graph.facebook.com/v17.0/${phoneId}/messages`, {
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: text },
    }, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    await this.prisma.quote.update({ where: { id: quoteId }, data: { status: 'SENT', sentAt: new Date() } });
  }
}
