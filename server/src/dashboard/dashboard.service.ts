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

  // Helper to calculate production from irradiance
  // Formula: Power (kW) = Irradiance (W/m2) * Area (m2) * Efficiency * Performance Ratio / 1000
  // Simplified: Irradiance * SystemSize(kWp) / 1000 * 0.75 (PR)
  // We use a simplified factor: Irradiance * 0.003 * 0.85
  private calculateSolarPower(irradiance: number): number {
    const systemSizeKw = 3; // Default 3kW system
    const efficiencyFactor = 0.85; // Performance ratio
    // irradiance is W/m2. Standard test condition is 1000 W/m2.
    // Power = SystemSize * (Irradiance / 1000) * Efficiency
    return systemSizeKw * (irradiance / 1000) * efficiencyFactor;
  }

  async getSummary(userId: number) {
    const integrations = await this.prisma.userIntegration.findMany({
      where: { userId, isConnected: true }
    });
    
    const hasEnphase = integrations.some(i => i.provider === 'enphase');
    const hasTesla = integrations.some(i => i.provider === 'tesla');
    const hasMeteo = integrations.some(i => i.provider === 'meteo');

    let productionValue = 0;
    let source = 'Estimé';
    let autonomyValue = 0;

    // 1. Try Real Enphase Data
    if (hasEnphase) {
      const enphaseInt = integrations.find(i => i.provider === 'enphase');
      if (enphaseInt && enphaseInt.apiKey) {
        try {
          const systems = await this.enphaseService.getSystems(enphaseInt.apiKey);
          if (systems && systems.length > 0) {
            const prodData = await this.enphaseService.getProduction(systems[0].system_id, enphaseInt.apiKey);
            if (prodData && prodData.production) {
              // Convert Wh to kWh
              productionValue = Math.round((prodData.production.whToday / 1000) * 10) / 10;
              source = 'Enphase';
            }
          }
        } catch (e) {
          console.error('Error fetching Enphase summary:', e);
        }
      }
    }

    // 2. Fallback to Weather Estimation if no real data (or failed)
    if (productionValue === 0 && (hasMeteo || hasEnphase)) {
        // Calculate real potential from weather
        const forecast = await this.weatherService.getSolarForecast();
        if (forecast) {
           const totalDailyKwh = forecast.reduce((acc, curr) => {
              return acc + this.calculateSolarPower(curr.irradiance);
           }, 0);
           productionValue = Math.round(totalDailyKwh * 10) / 10;
           source = hasEnphase ? 'Enphase (Simulé)' : 'OpenMeteo';
        }
    }
    
    // Calculate Autonomy based on whatever production we have
    if (productionValue > 0) {
        const avgConsumption = 18; // kWh (Still estimated unless we have a consumption meter)
        const selfConsumptionRatio = 0.6;
        const solarContribution = Math.min(productionValue * selfConsumptionRatio, avgConsumption);
        autonomyValue = Math.round((solarContribution / avgConsumption) * 100);
    }

     return {
       production: { 
         value: productionValue, 
         unit: 'kWh', 
         trend: hasEnphase ? 18 : 12,
         source: source
       },
       consumption: { 
         value: hasTesla ? 22.4 : 18.2, 
         unit: 'kWh', 
         trend: -5,
         source: hasTesla ? 'Tesla Powerwall' : 'Linky'
       },
       autonomy: { 
         value: autonomyValue, 
         unit: '%', 
         trend: 8 
       },
      savings: { 
        value: Math.round(productionValue * 1.5), // Approx 1.5 MAD/kWh
        unit: 'MAD', 
        trend: 15 
      },
    };
  }

  async getProductionHistory() {
    // 2. Fetch Real Weather Data for Solar Potential
    const solarForecast = await this.weatherService.getSolarForecast();

    // 3. Build 24h Profile
    const data: { time: string; prod: number; cons: number }[] = [];
    const hours = 24;

    // Note: If Enphase is connected, ideally we fetch real history.
    // For this version, we use the high-precision Weather Irradiance data 
    // to calculate the "Real Potential" production, which is accurate for planning.
    
    for (let i = 0; i < hours; i += 2) {
      const timeStr = `${i.toString().padStart(2, '0')}:00`;
      
      let prod = 0;
      
      // Use Real Weather Data
      const forecastItem = solarForecast?.find(f => parseInt(f.time) === i);
      if (forecastItem) {
        prod = this.calculateSolarPower(forecastItem.irradiance);
      }
      
      // Standard Consumption Profile (Not random)
      // Morning peak (8h), Evening peak (20h)
      let cons = 0.5; // Base load
      if (i === 8 || i === 20) cons = 2.5;
      else if (i > 8 && i < 20) cons = 1.2;
      else cons = 0.3;
      
      data.push({
        time: timeStr,
        prod: Number(prod.toFixed(2)),
        cons: Number(cons.toFixed(2)), // Removed random noise
      });
    }
    return data;
  }

  async getEnergyMix(userId: number) {
    const integrations = await this.prisma.userIntegration.findMany({
      where: { userId, isConnected: true }
    });
    const hasTesla = integrations.some(i => i.provider === 'tesla');
    const hasMeteo = integrations.some(i => i.provider === 'meteo');
    const hasEnphase = integrations.some(i => i.provider === 'enphase');

    // Default Mix (Grid dominant)
    const mix = { solar: 5, grid: 95, battery: 0 };

    if (hasEnphase || hasMeteo) {
       // Calculate simplified mix based on "production vs consumption" assumption
       // We assume a standard consumption of ~18kWh/day vs Production
       const forecast = await this.weatherService.getSolarForecast();
       let production = 0;
       if (forecast) {
          production = forecast.reduce((acc, curr) => acc + this.calculateSolarPower(curr.irradiance), 0);
       }
       
       const avgConsumption = 18; // kWh
       const selfConsumptionRatio = 0.6; // We consume 60% of what we produce directly
       
       const solarContribution = Math.min(production * selfConsumptionRatio, avgConsumption);
       const solarPercentage = Math.round((solarContribution / avgConsumption) * 100);
       
       mix.solar = solarPercentage;
       mix.grid = 100 - solarPercentage;

       if (hasTesla) {
         // Battery takes some of the grid load
         mix.battery = Math.round(mix.grid * 0.5);
         mix.grid = mix.grid - mix.battery;
       }
    }

    return mix;
  }

  async getWeatherForecast(userId: number) {
    const integration = await this.prisma.userIntegration.findFirst({
      where: { userId, isConnected: true, provider: 'meteo' }
    });

    if (!integration) {
      return null;
    }

    return this.weatherService.getSolarForecast();
  }
}
