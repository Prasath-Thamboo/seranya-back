import { Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
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

  @Post('cancel-subscription')
  async cancelSubscription(@Req() req: any, @Res() res: Response) {
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user || !user.stripeSubscriptionId) {
      return res.status(400).json({ error: 'Subscription not found' });
    }

    const result = await this.paymentService.cancelSubscription(
      user.stripeSubscriptionId,
    );

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isSubscribed: false,
        stripeSubscriptionId: null,
        role: user.role === 'EDITOR' ? 'USER' : user.role,
      },
    });

    res.json({ result });
  }
}
