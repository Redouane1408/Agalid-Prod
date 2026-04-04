import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { OwnerSettingsService } from './owner-settings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UpdateOwnerSettingsDto } from './dto/update-owner-settings.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('owner-settings')
export class OwnerSettingsController {
  constructor(private readonly ownerSettingsService: OwnerSettingsService) {}

  @Get()
  async getSettings() {
    return this.ownerSettingsService.getSettings();
  }

  @Put()
  async updateSettings(@Body() dto: UpdateOwnerSettingsDto) {
    return this.ownerSettingsService.updateSettings(dto);
  }
}
