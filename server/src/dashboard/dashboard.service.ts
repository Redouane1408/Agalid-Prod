import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { WeatherService } from '../integrations/providers/weather.service';
import { EnphaseService } from '../integrations/providers/enphase.service';

@Injectable()
export class DashboardService {
  constructor(
    private prisma: PrismaService,
    private weatherService: WeatherService,
    private enphaseService: EnphaseService
  ) {}

  private calculateSolarPower(irradiance: number, systemSizeKw = 3): number {
    const efficiencyFactor = 0.85;
    return systemSizeKw * (irradiance / 1000) * efficiencyFactor;
  }

  private round(value: number, digits = 1) {
    return Number(value.toFixed(digits));
  }

  private getLocationCoordinates(location?: string) {
    const normalized = (location || '').toLowerCase();
    const locations = [
      { keywords: ['alger', 'algiers'], latitude: 36.7538, longitude: 3.0588 },
      { keywords: ['oran'], latitude: 35.6981, longitude: -0.6348 },
      { keywords: ['constantine'], latitude: 36.365, longitude: 6.6147 },
      { keywords: ['annaba'], latitude: 36.9, longitude: 7.7667 },
      { keywords: ['blida'], latitude: 36.4701, longitude: 2.8277 },
      { keywords: ['sétif', 'setif'], latitude: 36.1911, longitude: 5.4137 },
      { keywords: ['béjaïa', 'bejaia'], latitude: 36.7525, longitude: 5.0556 },
      { keywords: ['tlemcen'], latitude: 34.8783, longitude: -1.315 },
      { keywords: ['ghardaïa', 'ghardaia'], latitude: 32.49, longitude: 3.673 },
      { keywords: ['ouargla'], latitude: 31.95, longitude: 5.3167 },
      { keywords: ['adrar'], latitude: 27.8743, longitude: -0.2939 },
    ];

    const match = locations.find((entry) => entry.keywords.some((keyword) => normalized.includes(keyword)));
    return match || locations[0];
  }

  private getConsumptionProfile(totalDailyConsumption: number) {
    const slots = [0.04, 0.03, 0.03, 0.05, 0.08, 0.11, 0.12, 0.1, 0.1, 0.14, 0.12, 0.08];
    return slots.map((weight) => this.round(totalDailyConsumption * weight, 2));
  }

  private async getUserEnergyContext(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true }
    });

    if (!user?.email) {
      return null;
    }

    const request = await this.prisma.clientRequest.findFirst({
      where: { email: user.email },
      orderBy: { createdAt: 'desc' },
      include: {
        quotes: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    const quote = request?.quotes[0] || null;
    const dailyConsumption = request ? request.monthlyConsumption / 30 : 18;
    const systemKw = quote?.systemKw || 0;
    const peakSunHours = request?.peakSunHours || 5;
    const coordinates = this.getLocationCoordinates(request?.location);

    return {
      request,
      quote,
      dailyConsumption,
      systemKw,
      peakSunHours,
      coordinates
    };
  }

  private async getWeatherDrivenProduction(systemKw: number, location?: string) {
    const { latitude, longitude } = this.getLocationCoordinates(location);
    const forecast = await this.weatherService.getSolarForecast(latitude, longitude, 'Africa/Algiers');
    const dailyProduction = forecast?.reduce((acc, curr) => {
      return acc + this.calculateSolarPower(curr.irradiance, systemKw || 3);
    }, 0) || 0;

    return {
      forecast,
      dailyProduction: this.round(dailyProduction, 1)
    };
  }

  private getPeriodWindow(period: string) {
    if (period === 'week') {
      return { label: '7j', archiveDays: 7 };
    }

    if (period === 'month') {
      return { label: '30j', archiveDays: 30 };
    }

    return { label: 'j', archiveDays: 1 };
  }

  private formatDateKey(date: Date) {
    return date.toISOString().slice(0, 10);
  }

  private async buildPeriodSeries(userId: number, period = 'day') {
    const context = await this.getUserEnergyContext(userId);
    const dailyConsumption = context?.dailyConsumption || 18;
    const systemKw = context?.systemKw || 3;
    const { latitude, longitude } = context?.coordinates || this.getLocationCoordinates();

    if (period === 'day') {
      const forecast = await this.weatherService.getSolarForecast(latitude, longitude, 'Africa/Algiers', 1);
      const consumptionProfile = this.getConsumptionProfile(dailyConsumption);
      const points: Array<{ time: string; prod: number; cons: number }> = [];

      for (let i = 0; i < 24; i += 2) {
        const timeStr = `${i.toString().padStart(2, '0')}:00`;
        const forecastItem = forecast?.find((f) => parseInt(f.time, 10) === i);
        const prod = forecastItem ? this.calculateSolarPower(forecastItem.irradiance, systemKw) : 0;

        points.push({
          time: timeStr,
          prod: Number(prod.toFixed(2)),
          cons: consumptionProfile[i / 2] || 0,
        });
      }

      return {
        points,
        dailyConsumption,
        unitLabel: 'kWh/j',
      };
    }

    const days = this.getPeriodWindow(period).archiveDays;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - (days - 1));

    const archive = await this.weatherService.getSolarArchive(
      latitude,
      longitude,
      'Africa/Algiers',
      this.formatDateKey(startDate),
      this.formatDateKey(endDate),
    );

    const grouped = new Map<string, { prod: number; cons: number }>();

    archive?.forEach((point) => {
      const dateKey = point.timestamp.slice(0, 10);
      const current = grouped.get(dateKey) || { prod: 0, cons: dailyConsumption };
      current.prod += this.calculateSolarPower(point.irradiance, systemKw);
      grouped.set(dateKey, current);
    });

    const points = Array.from(grouped.entries()).map(([dateKey, value]) => ({
      time: new Date(dateKey).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
      prod: Number(value.prod.toFixed(2)),
      cons: Number(value.cons.toFixed(2)),
    }));

    return {
      points,
      dailyConsumption,
      unitLabel: `kWh/${this.getPeriodWindow(period).label}`,
    };
  }

  async getAdminStats() {
    const [products, quotes, users, totalQuoteValue, categories, monthlyQuotes, recentQuotes] = await Promise.all([
      this.prisma.product.count(),
      this.prisma.quote.count(),
      this.prisma.user.count(),
      this.prisma.quote.aggregate({ _sum: { totalDa: true } }),
      this.prisma.category.findMany({
        include: { _count: { select: { products: true } } },
        orderBy: { name: 'asc' }
      }),
      this.prisma.quote.findMany({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth() - 5, 1)
          }
        },
        orderBy: { createdAt: 'asc' },
        select: { createdAt: true, totalDa: true }
      }),
      this.prisma.quote.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { request: true }
      })
    ]);

    const monthlyMap = new Map<string, { month: string; quotes: number; totalDa: number }>();

    monthlyQuotes.forEach((quote) => {
      const month = new Intl.DateTimeFormat('fr-FR', { month: 'short', year: '2-digit' }).format(quote.createdAt);
      const current = monthlyMap.get(month) || { month, quotes: 0, totalDa: 0 };
      current.quotes += 1;
      current.totalDa += quote.totalDa;
      monthlyMap.set(month, current);
    });

    return {
      products,
      quotes,
      users,
      totalQuoteValue: totalQuoteValue._sum.totalDa || 0,
      categoryStats: categories.map((category) => ({
        name: category.name,
        products: category._count.products
      })),
      monthlyQuotes: Array.from(monthlyMap.values()),
      recentQuotes: recentQuotes.map((quote) => ({
        id: quote.id,
        createdAt: quote.createdAt,
        totalDa: quote.totalDa,
        customerName: quote.request.name,
        location: quote.request.location
      }))
    };
  }

  async getSummary(userId: number, period = 'day') {
    const integrations = await this.prisma.userIntegration.findMany({
      where: { userId, isConnected: true }
    });
    const hasEnphase = integrations.some(i => i.provider === 'enphase');
    const hasTesla = integrations.some(i => i.provider === 'tesla');
    const context = await this.getUserEnergyContext(userId);
    const series = await this.buildPeriodSeries(userId, period);

    let productionValue = 0;
    let source = 'Estimé';
    const totalConsumption = this.round(series.points.reduce((sum, point) => sum + point.cons, 0), 1);

    if (period === 'day' && hasEnphase) {
      const enphaseInt = integrations.find(i => i.provider === 'enphase');
      const credential = enphaseInt?.apiKey || enphaseInt?.accessToken || '';
      if (credential) {
        try {
          const systems = await this.enphaseService.getSystems(credential);
          if (systems && systems.length > 0) {
            const prodData = await this.enphaseService.getProduction(systems[0].system_id, credential);
            if (prodData && prodData.production) {
              productionValue = this.round((prodData.production.whToday || 0) / 1000, 1);
              source = prodData.type === 'simulated' ? 'Enphase simulé' : 'Enphase';
            }
          }
        } catch (e) {
          console.error('Error fetching Enphase summary:', e);
        }
      }
    }

    if (productionValue === 0) {
      productionValue = this.round(series.points.reduce((sum, point) => sum + point.prod, 0), 1);
      source = period === 'day' ? 'Estimation météo' : 'Historique météo';
    }

    if (productionValue === 0 && context?.systemKw) {
      productionValue = this.round(context.systemKw * context.peakSunHours * 0.85, 1);
      source = 'Devis';
    }

    const solarDirect = Math.min(productionValue, totalConsumption);
    const autonomyValue = totalConsumption > 0 ? Math.round((solarDirect / totalConsumption) * 100) : 0;
    const batteryContribution = hasTesla ? Math.min(Math.max(productionValue - solarDirect, 0), Math.max(totalConsumption - solarDirect, 0)) : 0;
    const savingsValue = Math.round((solarDirect + batteryContribution) * 5.4);

    return {
      production: {
        value: productionValue,
        unit: series.unitLabel,
        source
      },
      consumption: {
        value: totalConsumption,
        unit: series.unitLabel,
        source: context?.request ? 'Demande client' : 'Estimation'
      },
      autonomy: {
        value: autonomyValue,
        unit: '%'
      },
      savings: {
        value: savingsValue,
        unit: period === 'day' ? 'DZD/j' : period === 'week' ? 'DZD/7j' : 'DZD/30j'
      },
    };
  }

  async getProductionHistory(userId: number, period = 'day') {
    const series = await this.buildPeriodSeries(userId, period);
    return series.points;
  }

  async getEnergyMix(userId: number, period = 'day') {
    const integrations = await this.prisma.userIntegration.findMany({
      where: { userId, isConnected: true }
    });
    const hasTesla = integrations.some(i => i.provider === 'tesla');
    const series = await this.buildPeriodSeries(userId, period);
    const productionTotal = series.points.reduce((sum, point) => sum + point.prod, 0);
    const consumptionTotal = series.points.reduce((sum, point) => sum + point.cons, 0);
    const solarDirect = Math.min(productionTotal, consumptionTotal);
    const remainingNeed = Math.max(consumptionTotal - solarDirect, 0);
    const batteryContribution = hasTesla
      ? Math.min(Math.max(productionTotal - solarDirect, 0), remainingNeed)
      : 0;
    const gridContribution = Math.max(consumptionTotal - solarDirect - batteryContribution, 0);
    const total = solarDirect + batteryContribution + gridContribution || 1;

    return {
      solar: Math.round((solarDirect / total) * 100),
      battery: Math.round((batteryContribution / total) * 100),
      grid: Math.max(0, 100 - Math.round((solarDirect / total) * 100) - Math.round((batteryContribution / total) * 100))
    };
  }

  async getWeatherForecast(userId: number) {
    const integration = await this.prisma.userIntegration.findFirst({
      where: { userId, isConnected: true, provider: 'meteo' }
    });

    if (!integration) {
      return null;
    }

    const context = await this.getUserEnergyContext(userId);
    return this.weatherService.getSolarForecast(
      context?.coordinates.latitude,
      context?.coordinates.longitude,
      'Africa/Algiers',
      1
    );
  }
}
