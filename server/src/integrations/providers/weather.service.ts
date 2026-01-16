import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);
  private readonly API_URL = 'https://api.open-meteo.com/v1/forecast';

  /**
   * Fetch solar irradiance forecast for the next 24 hours
   * Default location: Paris (can be parameterized per user in the future)
   */
  async getSolarForecast(latitude = 48.8566, longitude = 2.3522) {
    try {
      const response = await axios.get(this.API_URL, {
        params: {
          latitude,
          longitude,
          hourly: 'direct_radiation,diffuse_radiation,shortwave_radiation',
          timezone: 'Europe/Paris',
          forecast_days: 1,
        },
      });

      return this.processSolarData(response.data);
    } catch (error) {
      this.logger.error('Failed to fetch weather data', error);
      // Fallback to null or empty data to handle gracefully
      return null;
    }
  }

  private processSolarData(
    data: { hourly?: { time: string[]; direct_radiation: number[] } }
  ) {
    if (!data?.hourly) return [];

    const { time, direct_radiation } = data.hourly;
    
    return time.map((t: string, index: number) => ({
      time: t.substring(11, 16), // Extract HH:mm
      // Simple approximation: 1W/m² roughly translates to potential production
      // We'll normalize this in the DashboardService
      irradiance: direct_radiation[index] || 0, 
    }));
  }
}
