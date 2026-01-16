import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { EnphaseService } from './providers/enphase.service';

@Injectable()
export class IntegrationsService {
  constructor(
    private prisma: PrismaService,
    private enphaseService: EnphaseService
  ) {}

  async getUserIntegrations(userId: number) {
    return this.prisma.userIntegration.findMany({
      where: { userId },
    });
  }

  async connectIntegration(userId: number, provider: string, apiKey: string) {
    await this.validateApiKey(provider, apiKey);

    return this.prisma.userIntegration.upsert({
      where: {
        userId_provider: {
          userId,
          provider,
        },
      },
      update: {
        apiKey, // In real app, encrypt this!
        isConnected: true,
        lastSync: new Date(),
      },
      create: {
        userId,
        provider,
        apiKey,
        isConnected: true,
        lastSync: new Date(),
      },
    });
  }

  async handleOAuthCallback(userId: number, provider: string, code: string) {
    // In a real implementation, exchange 'code' for 'access_token' via HTTP call
    // For now, we simulate this exchange
    
    const mockAccessToken = `access_${provider}_${code}_${Math.random().toString(36).substr(2)}`;
    const mockRefreshToken = `refresh_${provider}_${code}_${Math.random().toString(36).substr(2)}`;
    
    return this.prisma.userIntegration.upsert({
      where: {
        userId_provider: {
          userId,
          provider,
        },
      },
      update: {
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken,
        isConnected: true,
        lastSync: new Date(),
        expiresAt: new Date(Date.now() + 3600 * 1000), // 1 hour
      },
      create: {
        userId,
        provider,
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken,
        isConnected: true,
        lastSync: new Date(),
        expiresAt: new Date(Date.now() + 3600 * 1000),
      },
    });
  }

  getOAuthUrl(provider: string) {
    const redirectUri = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/integrations/callback`;
    
    switch (provider) {
      case 'enphase': {
        const enphaseClientId = process.env.ENPHASE_CLIENT_ID || 'YOUR_ENPHASE_CLIENT_ID';
        return `https://api.enphaseenergy.com/oauth/authorize?response_type=code&client_id=${enphaseClientId}&redirect_uri=${encodeURIComponent(redirectUri)}`;
      }
      
      case 'tesla': {
        const teslaClientId = process.env.TESLA_CLIENT_ID || 'YOUR_TESLA_CLIENT_ID';
        const scopes = 'openid email offline_access vehicle_device_data vehicle_cmds vehicle_charging_cmds';
        return `https://auth.tesla.com/oauth2/v3/authorize?response_type=code&client_id=${teslaClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}`;
      }
      
      default:
        throw new BadRequestException('Provider non supporté pour OAuth');
    }
  }

  private async validateApiKey(provider: string, apiKey: string) {
    // Simulate API validation latency
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (!apiKey || apiKey.length < 5) {
      throw new BadRequestException('Clé API invalide (trop courte)');
    }

    switch (provider) {
      case 'linky':
        if (!/^\d{14}$/.test(apiKey)) {
          throw new BadRequestException('Le numéro PRM Linky doit comporter 14 chiffres');
        }
        break;
      case 'tesla':
        if (apiKey.length < 20) {
          throw new BadRequestException('Token Tesla invalide');
        }
        break;
      case 'enphase': {
        const isValid = await this.enphaseService.validateConnection(apiKey);
        if (!isValid) {
          throw new BadRequestException('Connexion Enphase échouée. Vérifiez votre clé/token.');
        }
        break;
      }
    }
  }
}
