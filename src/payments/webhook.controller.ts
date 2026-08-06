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

  //TESTEST
  async handleStripeWebhook(@Req() req: Request, @Res() res: Response) {
    const sig = req.headers['stripe-signature'] as string;

    try {
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET as string,
      );

      console.log('Stripe event received:', event.type);

      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;

          if (!session.metadata || !session.metadata.userId) {
            console.error('User ID is missing in metadata.');
            return res
              .status(400)
              .json({ error: 'User ID is missing in metadata' });
          }

          const subscriptionId = session.subscription as string;
          const userId = Number(session.metadata.userId);

          const user = await this.prisma.user.findUnique({
            where: { id: userId },
          });

          await this.prisma.user.update({
            where: { id: userId },
            data: {
              stripeSubscriptionId: subscriptionId,
              isSubscribed: true,
              // Ne jamais rétrograder un ADMIN : la souscription ne fait que promouvoir un USER en EDITOR
              role: user?.role === 'USER' ? 'EDITOR' : user?.role,
            },
          });

          break;
        }

        case 'customer.subscription.updated': {
          const subscription = event.data.object as Stripe.Subscription;
          const activeStatuses = ['active', 'trialing'];
          const isActive = activeStatuses.includes(subscription.status);

          const users = await this.prisma.user.findMany({
            where: { stripeSubscriptionId: subscription.id },
          });

          for (const user of users) {
            await this.prisma.user.update({
              where: { id: user.id },
              data: {
                isSubscribed: isActive,
                role: !isActive && user.role === 'EDITOR' ? 'USER' : user.role,
              },
            });
          }

          break;
        }

        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription;

          const users = await this.prisma.user.findMany({
            where: { stripeSubscriptionId: subscription.id },
          });

          for (const user of users) {
            await this.prisma.user.update({
              where: { id: user.id },
              data: {
                isSubscribed: false,
                stripeSubscriptionId: null,
                role: user.role === 'EDITOR' ? 'USER' : user.role,
              },
            });
          }

          break;
        }

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      res.json({ received: true });
    } catch (err) {
      console.error('Webhook error:', err);
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }
}
