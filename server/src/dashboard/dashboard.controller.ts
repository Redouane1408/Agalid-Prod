import { Controller, Get, UseGuards, Request } from '@nestjs/common';
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
  getHistory() {
    return this.dashboardService.getProductionHistory();
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
