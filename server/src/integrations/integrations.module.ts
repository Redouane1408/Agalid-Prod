import { Module } from '@nestjs/common';
import { IntegrationsController } from './integrations.controller';
import { IntegrationsService } from './integrations.service';
import { WeatherService } from './providers/weather.service';
import { EnphaseService } from './providers/enphase.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [IntegrationsController],
  providers: [IntegrationsService, WeatherService, EnphaseService, PrismaService],
  exports: [IntegrationsService, WeatherService, EnphaseService],
})
export class IntegrationsModule {}
