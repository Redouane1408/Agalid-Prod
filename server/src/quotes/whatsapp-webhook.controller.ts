import { Controller, Get, Post, Query, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';

@Controller('webhooks/whatsapp')
export class WhatsappWebhookController {
  private safeJson(value: unknown): string {
    try {
      return JSON.stringify(value);
    } catch {
      return '"<unserializable>"';
    }
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  private getArray(value: unknown): unknown[] {
    return Array.isArray(value) ? value : [];
  }

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
      const body: unknown = req.body;

      const summaries: Array<Record<string, unknown>> = [];

      const entries =
        this.isRecord(body) && Array.isArray(body.entry) ? (body.entry as unknown[]) : [];
      for (const entry of entries) {
        const changes =
          this.isRecord(entry) && Array.isArray(entry.changes) ? (entry.changes as unknown[]) : [];
        for (const change of changes) {
          const value = this.isRecord(change) ? change.value : undefined;
          const valueRecord = this.isRecord(value) ? value : undefined;
          const statuses = this.getArray(valueRecord?.statuses);
          for (const status of statuses) {
            const statusRecord = this.isRecord(status) ? status : undefined;
            const conversation = this.isRecord(statusRecord?.conversation)
              ? statusRecord.conversation
              : undefined;
            const pricing = this.isRecord(statusRecord?.pricing) ? statusRecord.pricing : undefined;
            summaries.push({
              kind: 'status',
              messageId: statusRecord?.id,
              status: statusRecord?.status,
              timestamp: statusRecord?.timestamp,
              recipientId: statusRecord?.recipient_id,
              conversationId: conversation?.id,
              pricingModel: pricing?.pricing_model,
              errors: statusRecord?.errors,
            });
          }

          const messages = this.getArray(valueRecord?.messages);
          for (const message of messages) {
            const messageRecord = this.isRecord(message) ? message : undefined;
            const text = this.isRecord(messageRecord?.text) ? messageRecord.text : undefined;
            summaries.push({
              kind: 'message',
              messageId: messageRecord?.id,
              from: messageRecord?.from,
              timestamp: messageRecord?.timestamp,
              type: messageRecord?.type,
              text: text?.body,
            });
          }
        }
      }

      console.log(
        `[${new Date().toISOString()}] WhatsApp webhook ${this.safeJson({
          headers: { 'user-agent': req.headers['user-agent'], 'content-type': req.headers['content-type'] },
          summaries,
        })}\n`
      );

      if (!summaries.length) {
        console.log(`[${new Date().toISOString()}] WhatsApp webhook raw ${this.safeJson(body)}\n`);
      }
    } catch {
      // ignore
    }
    return res.sendStatus(200);
  }
}
