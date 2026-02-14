import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as nodemailer from 'nodemailer';
import { WhatsappService } from './whatsapp.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class QuotesService {
  private log(message: string, data?: unknown) {
    const logDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logDir)) {
      try {
        fs.mkdirSync(logDir, { recursive: true });
      } catch (err) {
        console.error('Failed to create logs directory', err);
        return;
      }
    }
    const logFile = path.join(logDir, 'debug.log');
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
    const panelWattageW = 400; // 400 W par panneau
    const panelWattageKW = panelWattageW / 1000; // 0.4 kW
    const systemCostPerKW = 180000; // DZD/kW
    // Consommation journalière (kWh/jour)
    const dailyConsumption = form.monthlyConsumption / 30;
    // Puissance système requise (kW) : énergie/(heures * PR)
    const requiredSystemKw = dailyConsumption / Math.max(1, form.peakSunHours * systemEfficiency);
    // Nombre de panneaux nécessaire
    const panelCount = Math.max(1, Math.ceil(requiredSystemKw / panelWattageKW));
    // Taille du système dimensionné (kW)
    const systemKW = panelCount * panelWattageKW;
    // Coût estimé
    const systemCost = systemKW * systemCostPerKW;
    return { panelCount, systemKW, systemCost };
  }

  private generateEmailTemplate(quote: {
    systemKw: number;
    panelCount: number;
    totalDa: number;
    request: {
      name: string;
      location: string;
      monthlyConsumption: number;
      roofType: string;
      peakSunHours: number;
      phone?: string;
      address?: string;
      email?: string;
    };
  }): string {
    const dzdFormatter = new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD', maximumFractionDigits: 0 });
    const numberFormatter = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 });
    const year = new Date().getFullYear();
    
    // Estimate annual production (daily * 365)
    const dailyProd = (quote.systemKw * (quote.request.peakSunHours || 5)) * 0.85; 
    const annualProd = dailyProd * 365;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Votre Devis Solaire Agalid</title>
        <style>
          body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f0fdf4; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; color: #1e293b; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.05); margin-top: 40px; margin-bottom: 40px; border: 1px solid #e2e8f0; }
          
          .header { 
            background: linear-gradient(135deg, #059669 0%, #10b981 100%); 
            padding: 60px 40px; 
            text-align: center; 
            position: relative;
          }
          .header h1 { color: white; margin: 0; font-size: 32px; font-weight: 800; letter-spacing: -0.5px; }
          .header p { color: #d1fae5; margin-top: 12px; font-size: 16px; font-weight: 500; }
          
          .content { padding: 48px 40px; }
          
          .greeting { font-size: 20px; color: #0f172a; margin-bottom: 24px; font-weight: 600; }
          .intro { color: #475569; line-height: 1.7; font-size: 16px; margin-bottom: 32px; }
          
          .section-title { font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; font-weight: 700; margin-bottom: 16px; margin-top: 40px; }
          
          .card-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 32px; }
          .card { background: #f8fafc; padding: 24px; border-radius: 16px; border: 1px solid #e2e8f0; transition: transform 0.2s; }
          .card-label { color: #64748b; font-size: 13px; margin-bottom: 8px; display: block; font-weight: 500; }
          .card-value { color: #0f172a; font-size: 20px; font-weight: 700; display: flex; align-items: baseline; gap: 4px; }
          .card-unit { font-size: 14px; color: #64748b; font-weight: 500; }
          
          .details-list { background: #f8fafc; border-radius: 16px; padding: 8px; border: 1px solid #e2e8f0; }
          .detail-row { display: flex; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid #e2e8f0; }
          .detail-row:last-child { border-bottom: none; }
          .detail-label { color: #64748b; font-size: 15px; }
          .detail-value { color: #334155; font-weight: 600; font-size: 15px; }

          .total-section { 
            background: linear-gradient(to right, #ecfdf5, #f0fdf4); 
            padding: 40px; 
            border-radius: 20px; 
            text-align: center; 
            margin-top: 40px; 
            border: 1px solid #10b981; 
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.1);
          }
          .total-label { color: #059669; font-size: 16px; font-weight: 600; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px; }
          .total-value { color: #047857; font-size: 42px; font-weight: 800; letter-spacing: -1px; margin-bottom: 8px; }
          .total-sub { color: #059669; font-size: 14px; opacity: 0.9; }

          .footer { background: #f8fafc; padding: 40px; text-align: center; color: #94a3b8; font-size: 13px; border-top: 1px solid #e2e8f0; line-height: 1.6; }
          
          .button { 
            display: inline-block; 
            background: #0f172a; 
            color: white; 
            padding: 18px 36px; 
            border-radius: 100px; 
            text-decoration: none; 
            font-weight: 600; 
            margin-top: 32px; 
            box-shadow: 0 4px 12px rgba(15, 23, 42, 0.2);
            transition: all 0.2s;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Agalid</h1>
            <p>L'avenir solaire commence aujourd'hui</p>
          </div>
          <div class="content">
            <div class="greeting">Bonjour ${quote.request.name},</div>
            <p class="intro">
              Nous avons bien reçu votre demande pour votre projet à <strong>${quote.request.location}</strong>. 
              Voici votre étude personnalisée, conçue pour maximiser votre indépendance énergétique.
            </p>
            
            <div class="section-title">Votre Installation Recommandée</div>
            <div class="card-grid">
              <div class="card">
                <span class="card-label">Puissance Système</span>
                <span class="card-value">${numberFormatter.format(quote.systemKw)} <span class="card-unit">kWc</span></span>
              </div>
              <div class="card">
                <span class="card-label">Nombre de Panneaux</span>
                <span class="card-value">${quote.panelCount} <span class="card-unit">unités</span></span>
              </div>
              <div class="card">
                <span class="card-label">Production Estimée</span>
                <span class="card-value">${numberFormatter.format(annualProd)} <span class="card-unit">kWh/an</span></span>
              </div>
              <div class="card">
                <span class="card-label">Surface Requise</span>
                <span class="card-value">~${Math.ceil(quote.panelCount * 2)} <span class="card-unit">m²</span></span>
              </div>
            </div>

            <div class="section-title">Détails du Projet</div>
            <div class="details-list">
              <div class="detail-row">
                <span class="detail-label">Type de toit</span>
                <span class="detail-value">${quote.request.roofType === 'flat' ? 'Plat' : quote.request.roofType === 'sloped' ? 'Incliné' : 'Mixte'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Consommation actuelle</span>
                <span class="detail-value">${numberFormatter.format(quote.request.monthlyConsumption)} kWh/mois</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Localisation</span>
                <span class="detail-value">${quote.request.location}</span>
              </div>
              ${quote.request.address ? `
              <div class="detail-row">
                <span class="detail-label">Adresse</span>
                <span class="detail-value">${quote.request.address}</span>
              </div>` : ''}
              ${quote.request.phone ? `
              <div class="detail-row">
                <span class="detail-label">Téléphone</span>
                <span class="detail-value">${quote.request.phone}</span>
              </div>` : ''}
              ${quote.request.email ? `
              <div class="detail-row">
                <span class="detail-label">Email</span>
                <span class="detail-value">${quote.request.email}</span>
              </div>` : ''}
            </div>

            <div class="total-section">
              <div class="total-label">Investissement Total</div>
              <div class="total-value">${dzdFormatter.format(quote.totalDa)}</div>
              <p class="total-sub">Inclus : Matériel, Installation, et Garantie</p>
              
              <div style="text-align: center;">
                <a href="https://agalid.com" class="button">Confirmer mon projet</a>
              </div>
            </div>

          </div>
          <div class="footer">
            <p>Ce devis est une estimation préliminaire basée sur vos données.<br>
            Pour une étude technique approfondie, contactez nos experts.</p>
            <p style="margin-top: 20px;">© ${year} Agalid Algérie. Tous droits réservés.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async createForRequest(requestId: number) {
    const req = await this.prisma.clientRequest.findUnique({ where: { id: requestId } });
    if (!req) throw new NotFoundException('Request not found');
    const calc = this.calculate({ monthlyConsumption: req.monthlyConsumption, peakSunHours: req.peakSunHours });
    const quote = await this.prisma.quote.create({
      data: {
        requestId: req.id,
        totalDa: Math.round(calc.systemCost),
        panelCount: calc.panelCount,
        systemKw: calc.systemKW,
        status: 'DRAFT',
      },
    });

    // Automatically trigger WhatsApp sending
    // We don't await this to ensure the response is fast, but we log errors
    this.sendWhatsApp(quote.id).catch(err => {
      this.log('Failed to auto-send WhatsApp after creation', err);
    });

    return quote;
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
      const html = this.generateEmailTemplate(quote);
      await transport.sendMail({ to: quote.request.email, from, subject: `Votre étude solaire Agalid - ${quote.request.name}`, html });
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
    
    // Use env-configurable template and language (defaults chosen for Meta)
    const templateName = process.env.WHATSAPP_TEMPLATE_NAME || 'quote_notification';
    const languageCode = process.env.WHATSAPP_LANGUAGE || 'fr_FR';
    
    const dzdFormatter = new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD', maximumFractionDigits: 0 });
    const numFormatter = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 });
    
    // Calculate estimated annual production
    const dailyProd = (quote.systemKw * (quote.request.peakSunHours || 5)) * 0.85; 
    const annualProd = Math.round(dailyProd * 365);

    const parameters = [
      { type: 'text', text: quote.request.name },                    // {{1}} Name
      { type: 'text', text: quote.request.location },                // {{2}} Location
      { type: 'text', text: numFormatter.format(quote.systemKw) },   // {{3}} System Size (kW)
      { type: 'text', text: quote.panelCount.toString() },           // {{4}} Panel Count
      { type: 'text', text: numFormatter.format(annualProd) },       // {{5}} Annual Production (kWh)
      { type: 'text', text: dzdFormatter.format(quote.totalDa) }     // {{6}} Total Price
    ];
    
    try {
      this.log('Sending WhatsApp message via WhatsappService...');
      await this.whatsappService.sendTemplate(to, templateName, languageCode, parameters);
      
      this.log('WhatsApp sent successfully');
      await this.prisma.quote.update({ where: { id: quoteId }, data: { status: 'SENT', sentAt: new Date() } });
    } catch (e: unknown) {
      if (e instanceof Error) {
        this.log('WhatsApp send failed', { message: e.message, meta: { templateName, languageCode } });
      } else {
        this.log('WhatsApp send failed', { error: e, meta: { templateName, languageCode } });
      }
      // Do NOT mark as SENT if it failed
      throw e;
    }
  }
}
