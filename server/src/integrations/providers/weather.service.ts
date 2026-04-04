import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);
  private readonly FORECAST_API_URL = 'https://api.open-meteo.com/v1/forecast';
  private readonly ARCHIVE_API_URL = 'https://archive-api.open-meteo.com/v1/archive';

  async getSolarForecast(latitude = 36.7538, longitude = 3.0588, timezone = 'Africa/Algiers', forecastDays = 1) {
    try {
      const response = await axios.get(this.FORECAST_API_URL, {
        params: {
          latitude,
          longitude,
          hourly: 'direct_radiation,diffuse_radiation,shortwave_radiation',
          timezone,
          forecast_days: forecastDays,
        },
      });

      return this.processSolarData(response.data);
    } catch (error) {
      this.logger.error('Failed to fetch weather data', error);
      return null;
    }
  }

  async getSolarArchive(
    latitude = 36.7538,
    longitude = 3.0588,
    timezone = 'Africa/Algiers',
    startDate: string,
    endDate: string,
  ) {
    try {
      const response = await axios.get(this.ARCHIVE_API_URL, {
        params: {
          latitude,
          longitude,
          hourly: 'direct_radiation,diffuse_radiation,shortwave_radiation',
          timezone,
          start_date: startDate,
          end_date: endDate,
        },
      });

      return this.processSolarData(response.data);
    } catch (error) {
      this.logger.error('Failed to fetch archive weather data', error);
      return null;
    }
  }

  private processSolarData(
    data: { hourly?: { time: string[]; direct_radiation: number[] } }
  ) {
    if (!data?.hourly) return [];

    const { time, direct_radiation } = data.hourly;
    
    return time.map((t: string, index: number) => ({
      time: t.substring(11, 16),
      timestamp: t,
      irradiance: direct_radiation[index] || 0,
    }));
  }
}
