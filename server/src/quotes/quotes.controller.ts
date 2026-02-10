import { Controller, Param, Post } from '@nestjs/common';
import { QuotesService } from './quotes.service';

@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Post(':requestId/create')
  async create(@Param('requestId') requestId: string) {
    const quote = await this.quotesService.createForRequest(Number(requestId));
    return { id: quote.id };
  }

  @Post(':id/send-email')
  async sendEmail(@Param('id') id: string) {
    this.quotesService.sendEmail(Number(id)).catch(() => {});
    return { ok: true };
  }

  @Post(':id/send-whatsapp')
  async sendWhatsapp(@Param('id') id: string) {
    await this.quotesService.sendWhatsApp(Number(id));
    return { ok: true };
  }
}
