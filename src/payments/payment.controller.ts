import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PrismaService } from '../prisma/prisma.service';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('payment')
@UseGuards(JwtAuthGuard)
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('create-subscription')
  async createSubscription(@Req() req: any, @Res() res: Response) {
    const sessionUrl = await this.paymentService.createSubscriptionSession(
      req.user.id,
    );
    res.json({ sessionUrl });
  }

  @Get('subscription')
  async getSubscription(@Req() req: any, @Res() res: Response) {
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user?.stripeSubscriptionId) {
      return res.json({ subscribed: false });
    }

    try {
      const subscription = await this.paymentService.getSubscription(
        user.stripeSubscriptionId,
      );
      const item = subscription.items.data[0];

      res.json({
        subscribed: true,
        status: subscription.status,
        currentPeriodEnd: subscription.current_period_end ?? null,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        amount: item?.price?.unit_amount ?? null,
        currency: item?.price?.currency ?? null,
        interval: item?.price?.recurring?.interval ?? null,
      });
    } catch {
      // Abonnement introuvable côté Stripe (déjà résilié) mais DB pas encore synchronisée
      res.json({ subscribed: false });
    }
  }

  @Post('cancel-subscription')
  async cancelSubscription(@Req() req: any, @Res() res: Response) {
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user || !user.stripeSubscriptionId) {
      return res.status(400).json({ error: 'Subscription not found' });
    }

    await this.paymentService.cancelSubscription(user.stripeSubscriptionId);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isSubscribed: false,
        stripeSubscriptionId: null,
        role: user.role === 'EDITOR' ? 'USER' : user.role,
      },
    });

    res.json({ success: true });
  }
}
