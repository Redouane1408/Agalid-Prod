import { Controller, Get, Post, Body, Request, UseGuards, Param } from '@nestjs/common';
import { IntegrationsService } from './integrations.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('integrations')
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getUserIntegrations(@Request() req) {
    return this.integrationsService.getUserIntegrations(req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('connect')
  async connectIntegration(@Request() req, @Body() body: { provider: string; apiKey: string }) {
    return this.integrationsService.connectIntegration(req.user.userId, body.provider, body.apiKey);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('auth/:provider')
  async getAuthUrl(@Request() req, @Param('provider') provider: string) {
    const url = this.integrationsService.getOAuthUrl(provider);
    return { url };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('oauth-callback')
  async handleOAuthCallback(@Request() req, @Body() body: { provider: string; code: string }) {
    return this.integrationsService.handleOAuthCallback(req.user.userId, body.provider, body.code);
  }
}
