import { Body, Controller, Param, Post } from '@nestjs/common';
import { QuotesService } from './quotes.service';

@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Post(':requestId/create')
  async create(@Param('requestId') requestId: string) {
    const quote = await this.quotesService.createForRequest(Number(requestId));
    return quote;
  }

  @Post(':id/send-email')
  async sendEmail(
    @Param('id') id: string,
    @Body() body?: { pdfBase64?: string; filename?: string; mimeType?: string }
  ) {
    await this.quotesService.sendEmail(Number(id), body);
    return { ok: true };
  }

  @Post(':id/send-whatsapp')
  async sendWhatsapp(@Param('id') id: string) {
    const result = await this.quotesService.sendWhatsApp(Number(id));
    if (result && typeof result === 'object' && 'ok' in result && !result.ok) {
      return { ok: false, error: (result as { error?: unknown }).error ?? null };
    }
    return { ok: true };
  }
}
