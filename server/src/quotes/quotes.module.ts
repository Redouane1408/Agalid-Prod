import { Module } from '@nestjs/common';
import { QuotesService } from './quotes.service';
import { QuotesController } from './quotes.controller';
import { WhatsappService } from './whatsapp.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [QuotesController],
  providers: [QuotesService, WhatsappService, PrismaService],
})
export class QuotesModule {}

