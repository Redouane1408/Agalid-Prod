import { Injectable } from '@nestjs/common';
import { Prisma, OwnerSettings } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { UpdateOwnerSettingsDto } from './dto/update-owner-settings.dto';

@Injectable()
export class OwnerSettingsService {
  constructor(private prisma: PrismaService) {}

  private getDefaults(): Prisma.OwnerSettingsCreateInput {
    return {
      services: ['installation', 'maintenance', 'monitoring'],
      displayQuoteOnSite: true,
      sendEmailQuote: true,
      sendWhatsappQuote: true,
      requiredFields: ['name', 'email', 'phone', 'monthlyConsumption', 'roofArea', 'location'],
      defaultSystemEfficiency: 0.85,
      defaultPanelAreaM2: 2.2,
      defaultPanelPowerKw: 0.55,
      minimumPanelCount: 1,
      inverterSizingSafetyFactor: 1.1,
      quoteValidityDays: 30,
      installationBaseCostDa: 0,
      installationCostPerPanelDa: 0,
      structureCostPerPanelDa: 0,
      cablingCostPerKwDa: 0,
      protectionCostDa: 0,
      transportCostDa: 0,
      maintenanceCostDa: 0,
      shadingCostPercent: 0,
      marginPercent: 0,
      taxPercent: 0,
      roofTypeMultipliers: {
        flat: 1,
        sloped: 1,
        mixed: 1,
      },
      clientTypeMultipliers: {
        Particulier: 1,
        Entreprise: 1,
        Industrie: 1,
        Administration: 1,
      },
      businessRules: {
        productSelectionStrategy: 'best_price_per_power',
        panelCategoryKeyword: 'Panneaux',
        inverterCategoryKeyword: 'Onduleur',
        preferredPanelProductId: null,
        preferredInverterProductId: null,
        includeMaintenanceInQuote: false,
      },
    };
  }

  async getSettings(): Promise<OwnerSettings> {
    const existing = await this.prisma.ownerSettings.findFirst({
      orderBy: { updatedAt: 'desc' },
    });

    if (existing) {
      return existing;
    }

    return this.prisma.ownerSettings.create({
      data: this.getDefaults(),
    });
  }

  async updateSettings(dto: UpdateOwnerSettingsDto): Promise<OwnerSettings> {
    const existing = await this.getSettings();
    return this.prisma.ownerSettings.update({
      where: { id: existing.id },
      data: dto as Prisma.OwnerSettingsUpdateInput,
    });
  }
}
