import Stripe from 'stripe';
import { Injectable } from '@nestjs/common';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-06-20',
});

@Injectable()
export class PaymentService {
  async createSubscriptionSession(userId: number) {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: 'price_1QgNdG06xDQj9QaRFH8S3cxr', // Remplacez par votre price_id réel
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
  }

  // Méthode pour annuler un abonnement
  async cancelSubscription(subscriptionId: string) {
    // Utilisez 'cancel' au lieu de 'del' pour annuler un abonnement
    const canceledSubscription =
      await stripe.subscriptions.cancel(subscriptionId);
    return canceledSubscription;
  }
}
