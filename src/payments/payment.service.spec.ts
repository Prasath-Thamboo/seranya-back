const mockCheckoutCreate = jest.fn();
const mockSubscriptionsCancel = jest.fn();
const mockSubscriptionsUpdate = jest.fn();
const mockSubscriptionsRetrieve = jest.fn();

jest.mock('stripe', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    checkout: { sessions: { create: mockCheckoutCreate } },
    subscriptions: {
      cancel: mockSubscriptionsCancel,
      update: mockSubscriptionsUpdate,
      retrieve: mockSubscriptionsRetrieve,
    },
  })),
}));

import { InternalServerErrorException } from '@nestjs/common';
import { PaymentService } from './payment.service';

describe('PaymentService', () => {
  let service: PaymentService;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.FRONTEND_URL = 'https://www.seranya-blog.com';
    process.env.STRIPE_PRICE_ID = 'price_live_123';
    service = new PaymentService();
  });

  describe('createSubscriptionSession', () => {
    it('creates a subscription checkout session carrying the userId in metadata and returns its URL', async () => {
      mockCheckoutCreate.mockResolvedValue({
        url: 'https://checkout.stripe.com/s/xyz',
      });

      const url = await service.createSubscriptionSession(42);

      expect(url).toBe('https://checkout.stripe.com/s/xyz');
      const args = mockCheckoutCreate.mock.calls[0][0];
      expect(args.mode).toBe('subscription');
      expect(args.line_items[0].price).toBe('price_live_123');
      expect(args.metadata).toEqual({ userId: '42' });
      expect(args.success_url).toContain(
        'https://www.seranya-blog.com/subscription/success',
      );
    });

    it('wraps a Stripe failure into InternalServerErrorException', async () => {
      mockCheckoutCreate.mockRejectedValue(new Error('No such price'));

      await expect(
        service.createSubscriptionSession(42),
      ).rejects.toBeInstanceOf(InternalServerErrorException);
    });
  });

  describe('cancelSubscription', () => {
    it('cancels the subscription immediately', async () => {
      mockSubscriptionsCancel.mockResolvedValue({
        id: 'sub_1',
        status: 'canceled',
      });

      await service.cancelSubscription('sub_1');

      expect(mockSubscriptionsCancel).toHaveBeenCalledWith('sub_1');
    });

    it('wraps a Stripe failure into InternalServerErrorException', async () => {
      mockSubscriptionsCancel.mockRejectedValue(new Error('down'));

      await expect(service.cancelSubscription('sub_1')).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );
    });
  });

  describe('cancelSubscriptionAtPeriodEnd', () => {
    it('flags the subscription for cancellation at period end instead of cancelling now', async () => {
      mockSubscriptionsUpdate.mockResolvedValue({
        id: 'sub_1',
        cancel_at_period_end: true,
      });

      await service.cancelSubscriptionAtPeriodEnd('sub_1');

      expect(mockSubscriptionsUpdate).toHaveBeenCalledWith('sub_1', {
        cancel_at_period_end: true,
      });
    });
  });

  describe('getSubscription', () => {
    it('retrieves the subscription with the price expanded', async () => {
      mockSubscriptionsRetrieve.mockResolvedValue({ id: 'sub_1' });

      await service.getSubscription('sub_1');

      expect(mockSubscriptionsRetrieve).toHaveBeenCalledWith('sub_1', {
        expand: ['items.data.price'],
      });
    });
  });
});
