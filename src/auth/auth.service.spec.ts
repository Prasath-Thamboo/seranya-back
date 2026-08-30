import {
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: any;
  let mailer: any;
  let jwt: any;
  let payment: any;
  let notification: any;

  beforeEach(() => {
    prisma = {
      user: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      comment: { deleteMany: jest.fn() },
      userUnit: { deleteMany: jest.fn() },
      $transaction: jest.fn().mockResolvedValue([]),
    };
    mailer = {
      sendConfirmationEmail: jest.fn().mockResolvedValue(undefined),
      sendMail: jest.fn().mockResolvedValue(undefined),
    };
    jwt = { sign: jest.fn().mockReturnValue('signed.jwt.token') };
    payment = { cancelSubscription: jest.fn().mockResolvedValue(undefined) };
    notification = { create: jest.fn().mockResolvedValue(undefined) };

    service = new AuthService(prisma, mailer, jwt, payment, notification);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const dto = {
      email: 'alice@example.com',
      password: 'secret123',
      pseudo: 'alice',
    };

    it('hashes the password and forces the USER role on public registration', async () => {
      prisma.user.create.mockResolvedValue({ id: 1, ...dto, role: 'USER' });

      await service.register({ ...dto, role: 'ADMIN' } as any);

      const data = prisma.user.create.mock.calls[0][0].data;
      expect(data.role).toBe('USER');
      expect(data.password).not.toBe(dto.password);
      await expect(bcrypt.compare(dto.password, data.password)).resolves.toBe(
        true,
      );
    });

    it('creates a NEW_USER notification for the admins', async () => {
      prisma.user.create.mockResolvedValue({ id: 42, ...dto, role: 'USER' });

      await service.register(dto as any);

      expect(notification.create).toHaveBeenCalledWith(
        'NEW_USER',
        expect.stringContaining('alice'),
        '/admin/users/42',
      );
    });

    it('rejects a duplicate email/pseudo with a ConflictException', async () => {
      prisma.user.create.mockRejectedValue({
        code: 'P2002',
        meta: { target: ['email'] },
      });

      await expect(service.register(dto as any)).rejects.toBeInstanceOf(
        ConflictException,
      );
    });

    it('still reports success when the confirmation email cannot be sent', async () => {
      prisma.user.create.mockResolvedValue({ id: 1, ...dto, role: 'USER' });
      mailer.sendConfirmationEmail.mockRejectedValue(new Error('smtp down'));

      const result = await service.register(dto as any);

      expect(result.user).toBeDefined();
      expect(result.message).toMatch(/n'a pas pu être envoyé/);
    });
  });

  describe('login', () => {
    const buildUser = async (overrides: any = {}) => ({
      id: 7,
      email: 'bob@example.com',
      password: await bcrypt.hash('goodpass', 10),
      role: 'USER',
      status: 'verifie',
      ...overrides,
    });

    it('rejects an unknown email', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'nobody@example.com', password: 'x' } as any),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('rejects a wrong password', async () => {
      prisma.user.findUnique.mockResolvedValue(await buildUser());

      await expect(
        service.login({
          email: 'bob@example.com',
          password: 'wrongpass',
        } as any),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('rejects a user whose email is not verified', async () => {
      prisma.user.findUnique.mockResolvedValue(
        await buildUser({ status: 'en_attente' }),
      );

      await expect(
        service.login({
          email: 'bob@example.com',
          password: 'goodpass',
        } as any),
      ).rejects.toThrow(/email doit être vérifié/);
    });

    it('returns a signed token for valid, verified credentials', async () => {
      prisma.user.findUnique.mockResolvedValue(await buildUser());

      const token = await service.login({
        email: 'bob@example.com',
        password: 'goodpass',
      } as any);

      expect(token).toBe('signed.jwt.token');
      expect(jwt.sign).toHaveBeenCalledWith(
        { email: 'bob@example.com', sub: 7, role: 'USER' },
        expect.any(Object),
      );
    });
  });

  describe('generateResetToken', () => {
    it('does nothing and sends no email for an unknown address (anti-enumeration)', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.generateResetToken('ghost@example.com'),
      ).resolves.toBeUndefined();

      expect(prisma.user.update).not.toHaveBeenCalled();
      expect(mailer.sendMail).not.toHaveBeenCalled();
    });

    it('stores a reset token and emails the link for a known address', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 3,
        email: 'bob@example.com',
      });
      prisma.user.update.mockResolvedValue({});

      await service.generateResetToken('bob@example.com');

      const data = prisma.user.update.mock.calls[0][0].data;
      expect(data.resetToken).toEqual(expect.any(String));
      expect(data.resetTokenExpiry).toBeInstanceOf(Date);
      expect(mailer.sendMail).toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('rejects an invalid or expired token', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      await expect(
        service.resetPassword({
          newPassword: 'brandnew123',
          resetToken: 'nope',
        } as any),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('hashes the new password and clears the reset token', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: 9 });
      prisma.user.update.mockResolvedValue({ id: 9 });

      await service.resetPassword({
        newPassword: 'brandnew123',
        resetToken: 'valid-token',
      } as any);

      const data = prisma.user.update.mock.calls[0][0].data;
      expect(data.password).not.toBe('brandnew123');
      expect(data.resetToken).toBeNull();
      expect(data.resetTokenExpiry).toBeNull();
    });
  });

  describe('confirmEmail', () => {
    it('rejects an invalid or expired token', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      await expect(service.confirmEmail('bad-token')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('is idempotent for an already verified user', async () => {
      prisma.user.findFirst.mockResolvedValue({
        id: 1,
        email: 'x@y.z',
        status: 'verifie',
      });

      const result = await service.confirmEmail('token');

      expect(result.message).toMatch(/déjà vérifié/);
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('flips the status to verifie and clears the confirmation token', async () => {
      prisma.user.findFirst.mockResolvedValue({
        id: 1,
        email: 'x@y.z',
        status: 'en_attente',
      });
      prisma.user.update.mockResolvedValue({ id: 1, status: 'verifie' });

      await service.confirmEmail('token');

      const data = prisma.user.update.mock.calls[0][0].data;
      expect(data.status).toBe('verifie');
      expect(data.confirmationToken).toBeNull();
    });
  });

  describe('deleteAccount', () => {
    it('throws NotFoundException when the account does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.deleteAccount(123)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('deletes the account without touching Stripe when there is no subscription', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 5,
        email: 'bob@example.com',
        stripeSubscriptionId: null,
      });

      const result = await service.deleteAccount(5);

      expect(payment.cancelSubscription).not.toHaveBeenCalled();
      expect(prisma.$transaction).toHaveBeenCalled();
      expect(mailer.sendMail).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Account deleted successfully' });
    });

    it('cancels the Stripe subscription before deleting the account', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 5,
        email: 'bob@example.com',
        stripeSubscriptionId: 'sub_123',
      });

      await service.deleteAccount(5);

      expect(payment.cancelSubscription).toHaveBeenCalledWith('sub_123');
    });

    it('still deletes the account when the Stripe cancellation fails', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 5,
        email: 'bob@example.com',
        stripeSubscriptionId: 'sub_123',
      });
      payment.cancelSubscription.mockRejectedValue(new Error('stripe down'));

      await expect(service.deleteAccount(5)).resolves.toEqual({
        message: 'Account deleted successfully',
      });
      expect(prisma.$transaction).toHaveBeenCalled();
    });
  });
});
