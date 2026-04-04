import { Controller, Get, Post, Query, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';

@Controller('webhooks/whatsapp')
export class WhatsappWebhookController {
  @Get()
  verifyWebhook(
    @Query('hub.mode') mode: string | undefined,
    @Query('hub.verify_token') token: string | undefined,
    @Query('hub.challenge') challenge: string | undefined,
    @Res() res: Response
  ) {
    const verifyToken = (process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || '').trim();
    if (mode === 'subscribe' && token && verifyToken && token === verifyToken && challenge) {
      return res.status(200).send(challenge);
    }
    return res.sendStatus(403);
  }

  @Post()
  receiveWebhook(@Req() req: Request, @Res() res: Response) {
    try {
      const body = req.body as unknown;
      console.log(
        `[${new Date().toISOString()}] WhatsApp webhook event ${body ? JSON.stringify(body) : ''}\n`
      );
    } catch {
      // ignore
    }
    return res.sendStatus(200);
  }
}

