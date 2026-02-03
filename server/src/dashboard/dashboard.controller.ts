import { Controller, Get, UseGuards, Query, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
@UseGuards(AuthGuard('jwt'))
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  getStats(@Request() req) {
    return this.dashboardService.getSummary(req.user.userId);
  }

  @Get('production')
  getHistory(@Request() req, @Query('period') period: string) {
    return this.dashboardService.getProductionHistory(req.user.userId, period);
  }

  @Get('mix')
  getMix(@Request() req) {
    return this.dashboardService.getEnergyMix(req.user.userId);
  }

  @Get('weather')
  getWeather(@Request() req) {
    return this.dashboardService.getWeatherForecast(req.user.userId);
  }
}
