import {
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let prisma: any;
  let mailer: any;
  let fileService: any;

  beforeEach(() => {
    prisma = {
      user: {
        create: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn().mockResolvedValue({ id: 1 }),
        delete: jest.fn().mockResolvedValue({ id: 1 }),
      },
    };
    mailer = {
      sendMail: jest.fn().mockResolvedValue(undefined),
      sendEmailChangeConfirmation: jest.fn().mockResolvedValue(undefined),
    };
    fileService = {
      uploadProfileImage: jest.fn().mockResolvedValue('https://cdn/p.jpg'),
    };
    service = new UserService(prisma, mailer, fileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validatePseudoFormat', () => {
    it('accepts a clean pseudo', () => {
      expect(service.validatePseudoFormat('alice_01')).toEqual({ valid: true });
    });

    it('rejects too short / too long', () => {
      expect(service.validatePseudoFormat('ab').valid).toBe(false);
      expect(service.validatePseudoFormat('a'.repeat(21)).valid).toBe(false);
    });

    it('rejects leading/trailing separators and consecutive specials', () => {
      expect(service.validatePseudoFormat('_alice').valid).toBe(false);
      expect(service.validatePseudoFormat('alice-').valid).toBe(false);
      expect(service.validatePseudoFormat('al__ice').valid).toBe(false);
    });

    it('rejects a blocklisted term even with accents/casing', () => {
      expect(service.validatePseudoFormat('SuperNazi').valid).toBe(false);
    });
  });

  describe('isPseudoAvailable', () => {
    it('excludes the current user from the uniqueness check', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      await service.isPseudoAvailable('alice', 5);

      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: {
          pseudo: { equals: 'alice', mode: 'insensitive' },
          NOT: { id: 5 },
        },
      });
    });

    it('reports unavailable when another row already has the pseudo', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: 9 });

      await expect(service.isPseudoAvailable('alice', 5)).resolves.toEqual({
        available: false,
      });
    });
  });

  describe('create', () => {
    it('hashes the password and sends a welcome email', async () => {
      prisma.user.create.mockResolvedValue({
        id: 1,
        email: 'a@gmail.com',
        name: 'Al',
      });

      await service.create({
        email: 'a@gmail.com',
        password: 'plaintext123',
        name: 'Al',
      } as any);

      const data = prisma.user.create.mock.calls[0][0].data;
      expect(data.password).not.toBe('plaintext123');
      await expect(bcrypt.compare('plaintext123', data.password)).resolves.toBe(
        true,
      );
      expect(mailer.sendMail).toHaveBeenCalledWith(
        'a@gmail.com',
        expect.any(String),
        expect.stringContaining('Al'),
      );
    });
  });

  describe('update', () => {
    it('hashes a new password when one is supplied', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 1, role: 'USER' });

      await service.update(1, { password: 'newpass123' } as any);

      const data = prisma.user.update.mock.calls[0][0].data;
      expect(data.password).not.toBe('newpass123');
    });

    it('coerces the multipart isSubscribed string into a real boolean', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 1, role: 'USER' });

      await service.update(1, { isSubscribed: 'true' } as any);

      expect(prisma.user.update.mock.calls[0][0].data.isSubscribed).toBe(true);
    });

    it('also clears isSubscribed when an EDITOR is demoted to USER', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 1, role: 'EDITOR' });

      await service.update(1, { role: 'USER' } as any);

      expect(prisma.user.update.mock.calls[0][0].data.isSubscribed).toBe(false);
    });

    it('uploads a new profile image and stores its url', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 1, role: 'USER' });

      await service.update(1, {} as any, { buffer: Buffer.from('x') } as any);

      expect(fileService.uploadProfileImage).toHaveBeenCalledWith(
        expect.anything(),
        1,
      );
      expect(prisma.user.update.mock.calls[0][0].data.profileImage).toBe(
        'https://cdn/p.jpg',
      );
    });
  });

  describe('requestEmailChange', () => {
    it('rejects when the new address equals the current one', async () => {
      prisma.user.findUnique.mockResolvedValueOnce({
        id: 1,
        email: 'same@gmail.com',
      });

      await expect(
        service.requestEmailChange(1, 'same@gmail.com'),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects when the new address is already used by someone else', async () => {
      prisma.user.findUnique
        .mockResolvedValueOnce({ id: 1, email: 'old@gmail.com' })
        .mockResolvedValueOnce({ id: 2, email: 'taken@gmail.com' });

      await expect(
        service.requestEmailChange(1, 'taken@gmail.com'),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('sends the confirmation mail before persisting the pending state', async () => {
      prisma.user.findUnique
        .mockResolvedValueOnce({ id: 1, email: 'old@gmail.com' })
        .mockResolvedValueOnce(null);

      await service.requestEmailChange(1, 'new@gmail.com');

      expect(mailer.sendEmailChangeConfirmation).toHaveBeenCalled();
      const data = prisma.user.update.mock.calls[0][0].data;
      expect(data.pendingEmail).toBe('new@gmail.com');
      expect(data.emailChangeToken).toEqual(expect.any(String));
    });
  });

  describe('confirmEmailChange', () => {
    it('rejects an invalid or expired token', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      await expect(service.confirmEmailChange('bad')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('promotes pendingEmail to email and clears the change tokens', async () => {
      prisma.user.findFirst.mockResolvedValue({
        id: 1,
        pendingEmail: 'new@gmail.com',
      });

      await service.confirmEmailChange('good-token');

      expect(prisma.user.update.mock.calls[0][0].data).toEqual({
        email: 'new@gmail.com',
        pendingEmail: null,
        emailChangeToken: null,
        emailChangeTokenExpiry: null,
      });
    });
  });
});
