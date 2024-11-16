import { Controller, Post, Req, Res } from '@nestjs/common';
import { Response, Request } from 'express';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service'; // Utilisez Prisma ou votre base de données

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-06-20',
});

@Controller('webhook')
export class WebhookController {
  constructor(private prisma: PrismaService) {}

  @Post('stripe')
  async handleStripeWebhook(@Req() req: Request, @Res() res: Response) {
    const sig = req.headers['stripe-signature'] as string;

    try {
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET as string, // Assurez-vous que ce secret est défini
      );

      // Loggez l'événement pour vérifier
      console.log('Stripe event received:', event.type);

      // Gestion des événements
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;

        console.log('Checkout session completed:', session);

        // Récupérer l'ID de l'abonnement créé
        const subscriptionId = session.subscription as string;

        // Assurez-vous que vous stockez cet ID d'abonnement dans votre base de données
        const userId = session.metadata.userId;

        // Sauvegarder l'ID de l'abonnement dans la base de données pour l'utilisateur
        await this.prisma.user.update({
          where: { id: Number(userId) },
          data: {
            stripeSubscriptionId: subscriptionId, // Ajoutez un champ dans votre modèle pour stocker l'ID de l'abonnement
            isSubscribed: true, // Mettez à jour le statut de l'abonnement
          },
        });
      }

      res.json({ received: true });
    } catch (err) {
      console.error('Webhook error:', err);
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }
}
