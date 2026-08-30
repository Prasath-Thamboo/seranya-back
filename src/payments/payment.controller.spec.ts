import { PaymentController } from './payment.controller';

describe('PaymentController', () => {
  let controller: PaymentController;
  let paymentService: any;
  let prisma: any;
  let res: any;

  beforeEach(() => {
    paymentService = {
      createSubscriptionSession: jest
        .fn()
        .mockResolvedValue('https://checkout/x'),
      getSubscription: jest.fn(),
      cancelSubscriptionAtPeriodEnd: jest.fn().mockResolvedValue({}),
    };
    prisma = { user: { findUnique: jest.fn() } };
    res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    controller = new PaymentController(paymentService, prisma);
  });

  describe('create-subscription', () => {
    it('creates the checkout session for the authenticated user only', async () => {
      await controller.createSubscription({ user: { id: 5 } }, res);

      expect(paymentService.createSubscriptionSession).toHaveBeenCalledWith(5);
      expect(res.json).toHaveBeenCalledWith({
        sessionUrl: 'https://checkout/x',
      });
    });
  });

  describe('GET subscription', () => {
    it('reports "not subscribed" when the user has no Stripe subscription id', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 5,
        stripeSubscriptionId: null,
      });

      await controller.getSubscription({ user: { id: 5 } }, res);

      expect(res.json).toHaveBeenCalledWith({ subscribed: false });
      expect(paymentService.getSubscription).not.toHaveBeenCalled();
    });

    it('maps the Stripe subscription into a compact status payload', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 5,
        stripeSubscriptionId: 'sub_1',
      });
      paymentService.getSubscription.mockResolvedValue({
        status: 'active',
        current_period_end: 1893456000,
        cancel_at_period_end: false,
        items: {
          data: [
            {
              price: {
                unit_amount: 500,
                currency: 'eur',
                recurring: { interval: 'month' },
              },
            },
          ],
        },
      });

      await controller.getSubscription({ user: { id: 5 } }, res);

      expect(res.json).toHaveBeenCalledWith({
        subscribed: true,
        status: 'active',
        currentPeriodEnd: 1893456000,
        cancelAtPeriodEnd: false,
        amount: 500,
        currency: 'eur',
        interval: 'month',
      });
    });

    it('falls back to "not subscribed" when Stripe no longer knows the subscription', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 5,
        stripeSubscriptionId: 'sub_gone',
      });
      paymentService.getSubscription.mockRejectedValue(
        new Error('No such subscription'),
      );

      await controller.getSubscription({ user: { id: 5 } }, res);

      expect(res.json).toHaveBeenCalledWith({ subscribed: false });
    });
  });

  describe('cancel-subscription', () => {
    it('returns 400 when there is nothing to cancel', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 5,
        stripeSubscriptionId: null,
      });

      await controller.cancelSubscription({ user: { id: 5 } }, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(
        paymentService.cancelSubscriptionAtPeriodEnd,
      ).not.toHaveBeenCalled();
    });

    it('schedules cancellation at period end (keeps access until paid period ends)', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 5,
        stripeSubscriptionId: 'sub_1',
      });

      await controller.cancelSubscription({ user: { id: 5 } }, res);

      expect(paymentService.cancelSubscriptionAtPeriodEnd).toHaveBeenCalledWith(
        'sub_1',
      );
      expect(res.json).toHaveBeenCalledWith({ success: true });
    });
  });
});
