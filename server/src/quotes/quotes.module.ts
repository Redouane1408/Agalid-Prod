import { Module } from '@nestjs/common';
import { QuotesService } from './quotes.service';
import { QuotesController } from './quotes.controller';
import { WhatsappService } from './whatsapp.service';
import { WhatsappWebhookController } from './whatsapp-webhook.controller';
import { PrismaService } from '../prisma.service';
import { OwnerSettingsModule } from '../owner-settings/owner-settings.module';

@Module({
  imports: [OwnerSettingsModule],
  controllers: [QuotesController, WhatsappWebhookController],
  providers: [QuotesService, WhatsappService, PrismaService],
})
export class QuotesModule {}
