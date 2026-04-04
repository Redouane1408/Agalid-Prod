import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as nodemailer from 'nodemailer';
import { WhatsappService } from './whatsapp.service';
import * as fs from 'fs';
import * as path from 'path';
import { OwnerSettingsService } from '../owner-settings/owner-settings.service';
import { OwnerSettings, Prisma } from '@prisma/client';

@Injectable()
export class QuotesService {
  private getQuoteReference(quoteId: number) {
    return `AGL-${quoteId.toString().padStart(6, '0')}`;
  }

  private getQuoteDocumentName(quoteId: number) {
    return `devis-agalid-${this.getQuoteReference(quoteId)}`;
  }

  private getRoofTypeLabel(roofType: string) {
    if (roofType === 'flat') return 'Plat';
    if (roofType === 'sloped') return 'Incliné';
    if (roofType === 'mixed') return 'Mixte';
    return roofType;
  }

  private getAnnualProduction(systemKw: number, peakSunHours: number) {
    const dailyProduction = systemKw * Math.max(peakSunHours || 0, 1) * 0.85;
    return Math.round(dailyProduction * 365);
  }

  private getSurfaceEstimate(panelCount: number) {
    return Math.ceil(panelCount * 2.2);
  }

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
    private whatsappService: WhatsappService,
    private ownerSettingsService: OwnerSettingsService,
  ) {}

  private parseJsonObject(value: Prisma.JsonValue | null | undefined) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return {};
    }
    return value as Record<string, unknown>;
  }

  private getNumericSpec(specs: Prisma.JsonValue | null | undefined, keys: string[]) {
    const parsed = this.parseJsonObject(specs);

    for (const key of keys) {
      const raw = parsed[key];
      if (typeof raw === 'number' && Number.isFinite(raw)) {
        return raw;
      }
      if (typeof raw === 'string') {
        const normalized = raw.replace(',', '.');
        const numeric = parseFloat(normalized.replace(/[^\d.]/g, ''));
        if (Number.isFinite(numeric)) {
          return numeric;
        }
      }
    }

    return null;
  }

  private getProductPowerKw(product: { specs?: Prisma.JsonValue | null } | null | undefined, fallbackPowerKw: number) {
    if (!product) {
      return fallbackPowerKw;
    }

    const numeric = this.getNumericSpec(product.specs, ['power', 'puissance', 'watts', 'w', 'powerKw', 'puissanceKw']);
    if (!numeric || numeric <= 0) {
      return fallbackPowerKw;
    }

    return numeric > 10 ? numeric / 1000 : numeric;
  }

  private getBusinessRules(settings: OwnerSettings) {
    const raw = this.parseJsonObject(settings.businessRules);
    return {
      productSelectionStrategy: String(raw.productSelectionStrategy || 'best_price_per_power'),
      panelCategoryKeyword: String(raw.panelCategoryKeyword || 'Panneaux'),
      inverterCategoryKeyword: String(raw.inverterCategoryKeyword || 'Onduleur'),
      preferredPanelProductId: raw.preferredPanelProductId ? Number(raw.preferredPanelProductId) : null,
      preferredInverterProductId: raw.preferredInverterProductId ? Number(raw.preferredInverterProductId) : null,
      includeMaintenanceInQuote: Boolean(raw.includeMaintenanceInQuote || false),
    };
  }

  private getMultiplier(json: Prisma.JsonValue | null | undefined, key: string) {
    const source = this.parseJsonObject(json);
    const value = source[key];
    if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
      return value;
    }
    if (typeof value === 'string') {
      const parsed = parseFloat(value.replace(',', '.'));
      if (Number.isFinite(parsed) && parsed > 0) {
        return parsed;
      }
    }
    return 1;
  }

  private roundCurrency(value: number) {
    return Math.round(value);
  }

  private buildQuoteBreakdown(params: {
    settings: OwnerSettings;
    request: {
      clientType: string;
      roofType: string;
      hasShading: boolean;
      monthlyConsumption: number;
      peakSunHours: number;
    };
    panelProduct: { id: number; name: string; price: number; specs?: Prisma.JsonValue | null };
    inverterProduct: { id: number; name: string; price: number; specs?: Prisma.JsonValue | null };
  }) {
    const { settings, request, panelProduct, inverterProduct } = params;
    const businessRules = this.getBusinessRules(settings);
    const panelPowerKw = this.getProductPowerKw(panelProduct, settings.defaultPanelPowerKw);
    const inverterPowerKw = this.getProductPowerKw(inverterProduct, panelPowerKw);
    const systemEfficiency = settings.defaultSystemEfficiency;
    const dailyConsumption = request.monthlyConsumption / 30;
    const requiredSystemKw = dailyConsumption / Math.max(1, request.peakSunHours * systemEfficiency);
    const panelCount = Math.max(settings.minimumPanelCount, Math.ceil(requiredSystemKw / panelPowerKw));
    const systemKw = Number((panelCount * panelPowerKw).toFixed(3));
    const requiredInverterKw = Number((systemKw * settings.inverterSizingSafetyFactor).toFixed(3));
    const panelSubtotalDa = this.roundCurrency(panelCount * panelProduct.price);
    const inverterSubtotalDa = this.roundCurrency(inverterProduct.price);
    const roofMultiplier = this.getMultiplier(settings.roofTypeMultipliers, request.roofType);
    const clientMultiplier = this.getMultiplier(settings.clientTypeMultipliers, request.clientType);
    const baseInstallationDa =
      settings.installationBaseCostDa +
      panelCount * settings.installationCostPerPanelDa +
      panelCount * settings.structureCostPerPanelDa +
      systemKw * settings.cablingCostPerKwDa +
      settings.protectionCostDa +
      settings.transportCostDa +
      (businessRules.includeMaintenanceInQuote ? settings.maintenanceCostDa : 0);
    const installationBeforeShadingDa = baseInstallationDa * roofMultiplier * clientMultiplier;
    const shadingSubtotalDa = request.hasShading
      ? installationBeforeShadingDa * (settings.shadingCostPercent / 100)
      : 0;
    const installationSubtotalDa = this.roundCurrency(installationBeforeShadingDa + shadingSubtotalDa);
    const hardwareSubtotalDa = this.roundCurrency(panelSubtotalDa + inverterSubtotalDa);
    const subtotalBeforeMarginDa = hardwareSubtotalDa + installationSubtotalDa;
    const marginSubtotalDa = this.roundCurrency(subtotalBeforeMarginDa * (settings.marginPercent / 100));
    const taxSubtotalDa = this.roundCurrency((subtotalBeforeMarginDa + marginSubtotalDa) * (settings.taxPercent / 100));
    const totalDa = hardwareSubtotalDa + installationSubtotalDa + marginSubtotalDa + taxSubtotalDa;
    const annualProductionKwh = Math.round(systemKw * Math.max(request.peakSunHours, 1) * systemEfficiency * 365);
    const surfaceEstimateM2 = Math.ceil(panelCount * settings.defaultPanelAreaM2);

    return {
      panelCount,
      systemKw,
      requiredSystemKw: Number(requiredSystemKw.toFixed(3)),
      requiredInverterKw,
      hardwareSubtotalDa,
      installationSubtotalDa,
      marginSubtotalDa,
      taxSubtotalDa,
      totalDa,
      annualProductionKwh,
      surfaceEstimateM2,
      systemEfficiency,
      quoteValidityDays: settings.quoteValidityDays,
      panelPowerKw,
      inverterPowerKw,
      lineItems: [
        {
          type: 'hardware',
          label: panelProduct.name,
          quantity: panelCount,
          unitPriceDa: this.roundCurrency(panelProduct.price),
          totalDa: panelSubtotalDa,
        },
        {
          type: 'hardware',
          label: inverterProduct.name,
          quantity: 1,
          unitPriceDa: this.roundCurrency(inverterProduct.price),
          totalDa: inverterSubtotalDa,
        },
        {
          type: 'service',
          label: 'Installation et mise en service',
          quantity: 1,
          unitPriceDa: installationSubtotalDa,
          totalDa: installationSubtotalDa,
        },
        {
          type: 'service',
          label: 'Marge commerciale',
          quantity: 1,
          unitPriceDa: marginSubtotalDa,
          totalDa: marginSubtotalDa,
        },
        {
          type: 'service',
          label: 'Taxes',
          quantity: 1,
          unitPriceDa: taxSubtotalDa,
          totalDa: taxSubtotalDa,
        },
      ],
      formulas: {
        dailyConsumption: 'monthlyConsumption / 30',
        requiredSystemKw: 'dailyConsumption / (peakSunHours * systemEfficiency)',
        panelCount: 'ceil(requiredSystemKw / panelPowerKw)',
        installationSubtotalDa: 'base + perPanel + structure + cabling + protection + transport + maintenance, puis multiplicateurs et ombrage',
        marginSubtotalDa: '(hardwareSubtotalDa + installationSubtotalDa) * marginPercent / 100',
        taxSubtotalDa: '(hardwareSubtotalDa + installationSubtotalDa + marginSubtotalDa) * taxPercent / 100',
      },
    };
  }

  private async selectPanelProduct(settings: OwnerSettings) {
    const rules = this.getBusinessRules(settings);

    if (rules.preferredPanelProductId) {
      const preferred = await this.prisma.product.findUnique({
        where: { id: rules.preferredPanelProductId },
        include: { category: true },
      });
      if (preferred) {
        return preferred;
      }
    }

    const panelCategory = await this.prisma.category.findFirst({
      where: { name: { contains: rules.panelCategoryKeyword, mode: 'insensitive' } },
    });

    if (!panelCategory) {
      throw new BadRequestException(`Aucune catégorie panneau trouvée pour "${rules.panelCategoryKeyword}"`);
    }

    const products = await this.prisma.product.findMany({
      where: { categoryId: panelCategory.id },
      include: { category: true },
    });

    if (products.length === 0) {
      throw new BadRequestException('Aucun produit panneau disponible dans la base');
    }

    if (rules.productSelectionStrategy === 'lowest_price') {
      return products.sort((a, b) => a.price - b.price)[0];
    }

    return products
      .map((product) => ({
        product,
        ratio: product.price / this.getProductPowerKw(product, settings.defaultPanelPowerKw),
      }))
      .sort((a, b) => a.ratio - b.ratio)[0].product;
  }

  private async selectInverterProduct(settings: OwnerSettings, requiredInverterKw: number) {
    const rules = this.getBusinessRules(settings);

    if (rules.preferredInverterProductId) {
      const preferred = await this.prisma.product.findUnique({
        where: { id: rules.preferredInverterProductId },
        include: { category: true },
      });
      if (preferred) {
        return preferred;
      }
    }

    const inverterCategory = await this.prisma.category.findFirst({
      where: { name: { contains: rules.inverterCategoryKeyword, mode: 'insensitive' } },
    });

    if (!inverterCategory) {
      throw new BadRequestException(`Aucune catégorie onduleur trouvée pour "${rules.inverterCategoryKeyword}"`);
    }

    const products = await this.prisma.product.findMany({
      where: { categoryId: inverterCategory.id },
      include: { category: true },
    });

    if (products.length === 0) {
      throw new BadRequestException('Aucun produit onduleur disponible dans la base');
    }

    const compatibleProducts = products.filter((product) => this.getProductPowerKw(product, settings.defaultPanelPowerKw) >= requiredInverterKw);
    const pool = compatibleProducts.length > 0 ? compatibleProducts : products;
    return pool.sort((a, b) => a.price - b.price)[0];
  }

  private generateEmailTemplate(quote: {
    id: number;
    createdAt: Date;
    systemKw: number;
    panelCount: number;
    totalDa: number;
    hardwareSubtotalDa: number;
    installationSubtotalDa: number;
    marginSubtotalDa: number;
    taxSubtotalDa: number;
    calculationSnapshot?: Prisma.JsonValue | null;
    items?: {
      product: { name: string; description?: string | null };
      quantity: number;
      unitPrice: number;
    }[];
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
    const quoteReference = this.getQuoteReference(quote.id);
    const snapshot = this.parseJsonObject(quote.calculationSnapshot);
    const quoteDate = new Date(quote.createdAt).toLocaleDateString('fr-FR');
    const validityDays = Number(snapshot.quoteValidityDays || 30);
    const validUntil = new Date(quote.createdAt.getTime() + validityDays * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR');
    const annualProd = Number(snapshot.annualProductionKwh || this.getAnnualProduction(quote.systemKw, quote.request.peakSunHours || 5));
    const surface = Number(snapshot.surfaceEstimateM2 || this.getSurfaceEstimate(quote.panelCount));
    const lineItems = Array.isArray(snapshot.lineItems) ? snapshot.lineItems as Array<Record<string, unknown>> : [];

    const itemsList = quote.items && quote.items.length > 0 
      ? `<div class="section-title">Équipements Inclus</div>
         <div class="details-list">
           ${quote.items.map(item => `
             <div class="detail-row">
               <div>
                 <div class="detail-label">${item.product.name}</div>
                 ${item.product.description ? `<div class="detail-sub">${item.product.description}</div>` : ''}
               </div>
               <span class="detail-value">x${item.quantity} · ${dzdFormatter.format(item.unitPrice)} / unité · ${dzdFormatter.format(item.unitPrice * item.quantity)}</span>
             </div>
           `).join('')}
         </div>`
      : '';
    const costBreakdown = lineItems.length > 0
      ? `<div class="section-title">Ventilation Financière</div>
         <div class="details-list">
           ${lineItems.map((item) => `
             <div class="detail-row">
               <span class="detail-label">${String(item.label || 'Ligne')}</span>
               <span class="detail-value">${dzdFormatter.format(Number(item.totalDa || 0))}</span>
             </div>
           `).join('')}
         </div>`
      : '';
    const subtotalBreakdown = `<div class="section-title">Sous-Totaux</div>
      <div class="details-list">
        <div class="detail-row">
          <span class="detail-label">Matériel</span>
          <span class="detail-value">${dzdFormatter.format(quote.hardwareSubtotalDa)}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Installation</span>
          <span class="detail-value">${dzdFormatter.format(quote.installationSubtotalDa)}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Marge</span>
          <span class="detail-value">${dzdFormatter.format(quote.marginSubtotalDa)}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Taxes</span>
          <span class="detail-value">${dzdFormatter.format(quote.taxSubtotalDa)}</span>
        </div>
      </div>`;

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
          .detail-sub { color: #94a3b8; font-size: 12px; margin-top: 4px; max-width: 320px; line-height: 1.4; }
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
              Vous trouverez ci-joint votre devis PDF. Les informations ci-dessous correspondent exactement au devis généré.
            </p>

            <div class="section-title">Référence du Devis</div>
            <div class="details-list">
              <div class="detail-row">
                <span class="detail-label">N° devis</span>
                <span class="detail-value">${quoteReference}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Date</span>
                <span class="detail-value">${quoteDate}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Validité</span>
                <span class="detail-value">${validUntil}</span>
              </div>
            </div>
            
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
                <span class="card-value">~${surface} <span class="card-unit">m²</span></span>
              </div>
            </div>

            ${itemsList}
            ${costBreakdown}
            ${subtotalBreakdown}

            <div class="section-title">Détails du Projet</div>
            <div class="details-list">
              <div class="detail-row">
                <span class="detail-label">Type de toit</span>
                <span class="detail-value">${this.getRoofTypeLabel(quote.request.roofType)}</span>
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
    const settings = await this.ownerSettingsService.getSettings();
    const panelProduct = await this.selectPanelProduct(settings);
    const initialBreakdown = this.buildQuoteBreakdown({
      settings,
      request: req,
      panelProduct,
      inverterProduct: {
        id: 0,
        name: 'Onduleur provisoire',
        price: 0,
        specs: { powerKw: panelProduct ? this.getProductPowerKw(panelProduct, settings.defaultPanelPowerKw) : settings.defaultPanelPowerKw },
      },
    });
    const inverterProduct = await this.selectInverterProduct(settings, initialBreakdown.requiredInverterKw);
    const breakdown = this.buildQuoteBreakdown({
      settings,
      request: req,
      panelProduct,
      inverterProduct,
    });

    const quote = await this.prisma.quote.create({
      data: {
        requestId: req.id,
        totalDa: breakdown.totalDa,
        hardwareSubtotalDa: breakdown.hardwareSubtotalDa,
        installationSubtotalDa: breakdown.installationSubtotalDa,
        marginSubtotalDa: breakdown.marginSubtotalDa,
        taxSubtotalDa: breakdown.taxSubtotalDa,
        panelCount: breakdown.panelCount,
        systemKw: breakdown.systemKw,
        status: 'DRAFT',
        calculationSnapshot: {
          settingsId: settings.id,
          generatedAt: new Date().toISOString(),
          businessRules: this.getBusinessRules(settings),
          roofMultiplier: this.getMultiplier(settings.roofTypeMultipliers, req.roofType),
          clientMultiplier: this.getMultiplier(settings.clientTypeMultipliers, req.clientType),
          ...breakdown,
        },
        items: {
          create: [
            {
              product: { connect: { id: panelProduct.id } },
              quantity: breakdown.panelCount,
              unitPrice: panelProduct.price,
            },
            {
              product: { connect: { id: inverterProduct.id } },
              quantity: 1,
              unitPrice: inverterProduct.price,
            },
          ]
        }
      },
      include: { request: true, items: { include: { product: { include: { category: true } } } } }
    });

    // Automatically trigger WhatsApp sending
    this.sendWhatsApp(quote.id).catch(err => {
      this.log('Failed to auto-send WhatsApp after creation', err);
    });

    return quote;
  }

  async sendEmail(
    quoteId: number,
    attachment?: {
      pdfBase64?: string;
      filename?: string;
      mimeType?: string;
    }
  ) {
    const settings = await this.ownerSettingsService.getSettings();
    const quote = await this.prisma.quote.findUnique({
      where: { id: quoteId },
      include: { request: true, items: { include: { product: { include: { category: true } } } } },
    });
    if (!quote) {
      return;
    }
    if (!settings.sendEmailQuote) {
      this.log('Email sending disabled by owner settings', { quoteId });
      return;
    }
    const deliveryEnv = (process.env.SEND_DELIVERY ?? '').trim().toLowerCase();
    const deliver = deliveryEnv ? deliveryEnv === 'true' : (process.env.NODE_ENV || '').toLowerCase() === 'production';
    this.log('Sending email logic triggered', { deliver, quoteId });
    if (!deliver) {
      return { ok: false, error: { message: 'Delivery disabled' } };
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
      const attachments = attachment?.pdfBase64
        ? [{
            filename: attachment.filename || `${this.getQuoteDocumentName(quote.id)}.pdf`,
            content: Buffer.from(attachment.pdfBase64, 'base64'),
            contentType: attachment.mimeType || 'application/pdf'
          }]
        : [];
      await transport.sendMail({
        to: quote.request.email,
        from,
        subject: `Votre devis solaire ${this.getQuoteReference(quote.id)} - ${quote.request.name}`,
        html,
        attachments
      });
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
    const settings = await this.ownerSettingsService.getSettings();
    const quote = await this.prisma.quote.findUnique({
      where: { id: quoteId },
      include: { request: true },
    });
    if (!quote) {
      return {
        ok: false,
        error: { message: 'Quote not found' },
      };
    }

    const deliveryEnv = (process.env.SEND_DELIVERY ?? '').trim().toLowerCase();
    const deliver = deliveryEnv ? deliveryEnv === 'true' : (process.env.NODE_ENV || '').toLowerCase() === 'production';
    this.log('Sending WhatsApp logic triggered', { deliver, quoteId });

    if (!settings.sendWhatsappQuote) {
      return {
        ok: false,
        error: { message: 'WhatsApp désactivé par les paramètres administrateur' },
      };
    }

    if (!deliver) {
      return { ok: false, error: { message: 'Delivery disabled' } };
    }

    const to = quote.request.phone;
    if (!to) {
      this.log('WhatsApp send skipped: No phone number provided');
      return { ok: false, error: { message: 'No phone number' } };
    }
    
    // Use env-configurable template and language (defaults chosen for Meta)
    const templateName = process.env.WHATSAPP_TEMPLATE_NAME || 'quote_notification';
    const languageCode = process.env.WHATSAPP_LANGUAGE || 'fr';
    const dzdFormatter = new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD', maximumFractionDigits: 0 });
    const numFormatter = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 });
    const quoteSnapshot = this.parseJsonObject(quote.calculationSnapshot);
    const annualProd = Number(
      quoteSnapshot.annualProductionKwh || this.getAnnualProduction(quote.systemKw, quote.request.peakSunHours || 5),
    );
    
    const parameters = [
      { type: 'text', text: quote.request.name },
      { type: 'text', text: numFormatter.format(quote.systemKw) },
      { type: 'text', text: numFormatter.format(annualProd) },
      { type: 'text', text: dzdFormatter.format(quote.totalDa) },
    ];
    
    try {
      this.log('Sending WhatsApp message via WhatsappService...');
      const resp = await this.whatsappService.sendTemplate(to, templateName, languageCode, parameters);
      if (resp && typeof resp === 'object') {
        const recipient = 'recipient' in resp ? (resp as { recipient?: unknown }).recipient : null;
        const messageId = 'messageId' in resp ? (resp as { messageId?: unknown }).messageId : null;
        this.log('WhatsApp accepted by Meta', { recipient, messageId });
      }
      this.log('WhatsApp sent successfully');
      await this.prisma.quote.update({ where: { id: quoteId }, data: { status: 'SENT', sentAt: new Date() } });
      return {
        ok: true,
        recipient: typeof resp === 'object' && resp !== null && 'recipient' in resp ? (resp as { recipient?: unknown }).recipient : null,
        messageId: typeof resp === 'object' && resp !== null && 'messageId' in resp ? (resp as { messageId?: unknown }).messageId : null,
        waId: typeof resp === 'object' && resp !== null && 'waId' in resp ? (resp as { waId?: unknown }).waId : null,
        sender: typeof resp === 'object' && resp !== null && 'sender' in resp ? (resp as { sender?: unknown }).sender : null,
        meta: { templateName, languageCode },
      };
    } catch (e: unknown) {
      let providerError: unknown = null;
      let message = 'Unknown error';

      if (e instanceof Error) {
        message = e.message;
      }

      if (typeof e === 'object' && e !== null && 'response' in e) {
        const resp = (e as { response?: unknown }).response;
        if (typeof resp === 'object' && resp !== null && 'data' in resp) {
          providerError = (resp as { data?: unknown }).data ?? null;
        }
      }

      this.log('WhatsApp send failed', { message, meta: { templateName, languageCode }, providerError });

      return {
        ok: false,
        error: {
          message,
          meta: { templateName, languageCode },
          providerError,
        },
      };
    }
  }
}
