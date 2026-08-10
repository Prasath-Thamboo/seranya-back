import Stripe from 'stripe';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-06-20',
});

@Injectable()
export class PaymentService {
  async createSubscriptionSession(userId: number) {
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'subscription',
        allow_promotion_codes: true,
        line_items: [
          {
            price: process.env.STRIPE_PRICE_ID as string,
            quantity: 1,
          },
        ],
        success_url: `${process.env.FRONTEND_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/subscription/cancel`,
        metadata: {
          userId: userId.toString(),
        },
      });

      return session.url;
    } catch (error) {
      console.error('Failed to create subscription session:', error);
      throw new InternalServerErrorException(
        'Failed to create subscription session',
      );
    }
  }

  // Résiliation immédiate : réservée à la suppression de compte, où il n'y a
  // plus d'utilisateur à qui laisser l'accès jusqu'à la fin de période.
  async cancelSubscription(subscriptionId: string) {
    try {
      const canceledSubscription =
        await stripe.subscriptions.cancel(subscriptionId);
      return canceledSubscription;
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      throw new InternalServerErrorException('Failed to cancel subscription');
    }
  }

  // Résiliation demandée par l'utilisateur : l'abonnement reste actif
  // jusqu'à la fin de la période déjà payée, Stripe le résiliera lui-même
  // à cette date (déclenchant le webhook customer.subscription.deleted).
  async cancelSubscriptionAtPeriodEnd(subscriptionId: string) {
    try {
      return await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });
    } catch (error) {
      console.error('Failed to schedule subscription cancellation:', error);
      throw new InternalServerErrorException('Failed to cancel subscription');
    }
  }

  async getSubscription(subscriptionId: string) {
    try {
      return await stripe.subscriptions.retrieve(subscriptionId, {
        expand: ['items.data.price'],
      });
    } catch (error) {
      console.error('Failed to retrieve subscription:', error);
      throw new InternalServerErrorException('Failed to retrieve subscription');
    }
  }
}
