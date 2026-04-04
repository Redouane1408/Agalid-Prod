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
    try {
      console.log(
        `[${new Date().toISOString()}] WhatsApp webhook verify request ${JSON.stringify({
          mode,
          tokenPresent: Boolean(token),
          challengePresent: Boolean(challenge),
        })}\n`
      );
    } catch {
      // ignore
    }
    const verifyToken = (process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'agalid_verify_123').trim();
    if (mode === 'subscribe' && token && token === verifyToken && challenge) {
      return res.status(200).send(challenge);
    }
    return res.sendStatus(403);
  }

  @Post()
  receiveWebhook(@Req() req: Request, @Res() res: Response) {
    try {
      const body = req.body as unknown;
      console.log(
        `[${new Date().toISOString()}] WhatsApp webhook event ${JSON.stringify({
          headers: { 'user-agent': req.headers['user-agent'], 'content-type': req.headers['content-type'] },
          body,
        })}\n`
      );
    } catch {
      // ignore
    }
    return res.sendStatus(200);
  }
}
