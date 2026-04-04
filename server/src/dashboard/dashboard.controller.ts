import { Controller, Get, UseGuards, Request, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DashboardService } from './dashboard.service';

import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller('dashboard')
@UseGuards(AuthGuard('jwt'))
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('admin-stats')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  getAdminStats() {
    return this.dashboardService.getAdminStats();
  }

  @Get('stats')
  getStats(@Request() req, @Query('period') period?: string) {
    return this.dashboardService.getSummary(req.user.userId, period);
  }

  @Get('production')
  getHistory(@Request() req, @Query('period') period?: string) {
    return this.dashboardService.getProductionHistory(req.user.userId, period);
  }

  @Get('mix')
  getMix(@Request() req, @Query('period') period?: string) {
    return this.dashboardService.getEnergyMix(req.user.userId, period);
  }

  @Get('weather')
  getWeather(@Request() req) {
    return this.dashboardService.getWeatherForecast(req.user.userId);
  }
}
