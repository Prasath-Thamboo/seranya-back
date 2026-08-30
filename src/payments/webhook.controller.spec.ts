const mockConstructEvent = jest.fn();

jest.mock('stripe', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    webhooks: { constructEvent: mockConstructEvent },
  })),
}));

import { WebhookController } from './webhook.controller';

describe('WebhookController.handleStripeWebhook', () => {
  let controller: WebhookController;
  let prisma: any;
  let res: any;
  const req: any = {
    headers: { 'stripe-signature': 'sig_test' },
    body: Buffer.from('{}'),
  };

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn().mockResolvedValue({}),
      },
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    controller = new WebhookController(prisma);
    mockConstructEvent.mockReset();
  });

  const fireEvent = (event: any) => {
    mockConstructEvent.mockReturnValue(event);
    return controller.handleStripeWebhook(req, res);
  };

  describe('checkout.session.completed', () => {
    it('promotes a USER to EDITOR and records the subscription', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 5, role: 'USER' });

      await fireEvent({
        type: 'checkout.session.completed',
        data: {
          object: { metadata: { userId: '5' }, subscription: 'sub_123' },
        },
      });

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 5 },
        data: {
          stripeSubscriptionId: 'sub_123',
          isSubscribed: true,
          role: 'EDITOR',
        },
      });
      expect(res.json).toHaveBeenCalledWith({ received: true });
    });

    it('never downgrades an ADMIN when they subscribe', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 1, role: 'ADMIN' });

      await fireEvent({
        type: 'checkout.session.completed',
        data: { object: { metadata: { userId: '1' }, subscription: 'sub_1' } },
      });

      expect(prisma.user.update.mock.calls[0][0].data.role).toBe('ADMIN');
    });

    it('returns 400 when the session metadata has no userId', async () => {
      await fireEvent({
        type: 'checkout.session.completed',
        data: { object: { metadata: {} } },
      });

      expect(res.status).toHaveBeenCalledWith(400);
      expect(prisma.user.update).not.toHaveBeenCalled();
    });
  });

  describe('customer.subscription.updated', () => {
    it('keeps the subscriber active while the subscription is active', async () => {
      prisma.user.findMany.mockResolvedValue([{ id: 5, role: 'EDITOR' }]);

      await fireEvent({
        type: 'customer.subscription.updated',
        data: { object: { id: 'sub_123', status: 'active' } },
      });

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 5 },
        data: { isSubscribed: true, role: 'EDITOR' },
      });
    });

    it('downgrades an EDITOR back to USER once the subscription is no longer active', async () => {
      prisma.user.findMany.mockResolvedValue([{ id: 5, role: 'EDITOR' }]);

      await fireEvent({
        type: 'customer.subscription.updated',
        data: { object: { id: 'sub_123', status: 'past_due' } },
      });

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 5 },
        data: { isSubscribed: false, role: 'USER' },
      });
    });
  });

  describe('customer.subscription.deleted', () => {
    it('clears the subscription and demotes an EDITOR', async () => {
      prisma.user.findMany.mockResolvedValue([{ id: 5, role: 'EDITOR' }]);

      await fireEvent({
        type: 'customer.subscription.deleted',
        data: { object: { id: 'sub_123' } },
      });

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 5 },
        data: { isSubscribed: false, stripeSubscriptionId: null, role: 'USER' },
      });
    });

    it('leaves an ADMIN role intact when their subscription ends', async () => {
      prisma.user.findMany.mockResolvedValue([{ id: 1, role: 'ADMIN' }]);

      await fireEvent({
        type: 'customer.subscription.deleted',
        data: { object: { id: 'sub_1' } },
      });

      expect(prisma.user.update.mock.calls[0][0].data.role).toBe('ADMIN');
    });
  });

  it('answers 400 when the Stripe signature cannot be verified', async () => {
    mockConstructEvent.mockImplementation(() => {
      throw new Error('bad signature');
    });

    await controller.handleStripeWebhook(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith(
      expect.stringContaining('Webhook Error'),
    );
  });
});
