import { Module } from '@nestjs/common';
import { OwnerSettingsController } from './owner-settings.controller';
import { OwnerSettingsService } from './owner-settings.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [OwnerSettingsController],
  providers: [OwnerSettingsService, PrismaService],
  exports: [OwnerSettingsService],
})
export class OwnerSettingsModule {}
