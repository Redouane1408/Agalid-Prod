import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { WeatherService } from '../integrations/providers/weather.service';

@Injectable()
export class DashboardService {
  constructor(
    private prisma: PrismaService,
    private weatherService: WeatherService
  ) {}

  async getSummary(userId: number) {
    const integrations = await this.prisma.userIntegration.findMany({
      where: { userId, isConnected: true }
    });
    
    const hasEnphase = integrations.some(i => i.provider === 'enphase');
    const hasTesla = integrations.some(i => i.provider === 'tesla');

    return {
      production: { 
        value: hasEnphase ? 32.5 : 24.5, 
        unit: 'kWh', 
        trend: hasEnphase ? 18 : 12,
        source: hasEnphase ? 'Enphase' : 'Estimé'
      },
      consumption: { 
        value: hasTesla ? 22.4 : 18.2, 
        unit: 'kWh', 
        trend: -5,
        source: hasTesla ? 'Tesla Powerwall' : 'Linky'
      },
      autonomy: { 
        value: hasTesla && hasEnphase ? 92 : 78, 
        unit: '%', 
        trend: 8 
      },
      savings: { 
        value: hasEnphase ? 580 : 450, 
        unit: 'MAD', 
        trend: 15 
      },
    };
  }

  async getProductionHistory(userId: number, period: string = 'today') {
    const integrations = await this.prisma.userIntegration.findMany({
      where: { userId, isConnected: true }
    });
    const hasEnphase = integrations.some(i => i.provider === 'enphase');

    // Mock data for 24 hours
    const data: { time: string; prod: number; cons: number }[] = [];
    const hours =
      period === 'today'
        ? 24
        : period === 'week'
        ? 24
        : 24;
    
    // Get real solar potential from weather service
    const solarForecast = await this.weatherService.getSolarForecast();

    for (let i = 0; i < hours; i += 2) {
      const timeStr = `${i.toString().padStart(2, '0')}:00`;
      
      let prod = 0;

      if (hasEnphase) {
         // If Enphase connected, we would use real history here
         if (i >= 6 && i <= 20) {
            prod = Math.sin(((i - 6) / 14) * Math.PI) * 150; 
         }
      } else {
         // Use Weather Data for "Estimation"
         const forecastItem = solarForecast?.find(f => parseInt(f.time) === i);
         if (forecastItem) {
            const systemSize = 3000; // 3kWp
            prod = (forecastItem.irradiance * systemSize * 0.15) / 1000; 
            prod = prod / 10; 
         }
      }
      
      // Consumption simulation (peaks morning and evening)
      let cons = 30;
      if (i === 8 || i === 20) cons = 80;
      else if (i > 8 && i < 20) cons = 45;
      
      data.push({
        time: timeStr,
        prod: Math.round(Math.max(0, prod)),
        cons: Math.round(Math.max(10, cons + (Math.random() * 10 - 5))),
      });
    }
    return data;
  }

  async getEnergyMix(userId: number) {
    const integrations = await this.prisma.userIntegration.findMany({
      where: { userId, isConnected: true }
    });
    const hasTesla = integrations.some(i => i.provider === 'tesla');
    const hasEnphase = integrations.some(i => i.provider === 'enphase');

    if (hasTesla && hasEnphase) {
      return { solar: 60, grid: 5, battery: 35 };
    } else if (hasEnphase) {
      return { solar: 80, grid: 20, battery: 0 };
    }

    return {
      solar: 75,
      grid: 20,
      battery: 5,
    };
  }
}
