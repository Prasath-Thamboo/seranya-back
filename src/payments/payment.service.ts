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
        line_items: [
          {
            price: 'price_1QgNdG06xDQj9QaRFH8S3cxr',
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
      throw new InternalServerErrorException('Failed to create subscription session');
    }
  }

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
}
