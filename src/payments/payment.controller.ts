import { Controller, Post, Body, Res } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PrismaService } from '../prisma/prisma.service'; // Importez PrismaService
import { Response } from 'express';

/////// Comment

@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly prisma: PrismaService, // Injectez PrismaService
  ) {}

  @Post('create-subscription')
  async createSubscription(
    @Body() body: { userId: number }, // Accepter userId du body
    @Res() res: Response,
  ) {
    console.log('UserId in request body:', body.userId); // Log de l'userId
    if (!body.userId) {
      return res.status(400).json({ error: 'User ID is missing' });
    }

    const sessionUrl = await this.paymentService.createSubscriptionSession(
      body.userId,
    );
    res.json({ sessionUrl });
  }

  // Nouvelle méthode pour annuler l'abonnement
  @Post('cancel-subscription')
  async cancelSubscription(
    @Body() body: { userId: number },
    @Res() res: Response,
  ) {
    // Utilisez Prisma pour récupérer l'utilisateur
    const user = await this.prisma.user.findUnique({
      where: { id: body.userId },
    });

    if (!user || !user.stripeSubscriptionId) {
      return res.status(400).json({ error: 'Subscription not found' });
    }

    // Annulez l'abonnement via le service de paiement
    const result = await this.paymentService.cancelSubscription(
      user.stripeSubscriptionId,
    );

    res.json({ result });
  }
}
