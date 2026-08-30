import { BadRequestException } from '@nestjs/common';
import { UserController } from './user.controller';

describe('UserController', () => {
  let controller: UserController;
  let service: any;

  beforeEach(() => {
    service = {
      create: jest.fn().mockResolvedValue({ id: 1 }),
      findAll: jest.fn().mockResolvedValue([]),
      findOne: jest.fn().mockResolvedValue({ id: 1 }),
      update: jest.fn().mockResolvedValue({ id: 1 }),
      remove: jest.fn().mockResolvedValue({ id: 1 }),
      send: jest.fn().mockResolvedValue(undefined),
      validatePseudoFormat: jest.fn().mockReturnValue({ valid: true }),
      isPseudoAvailable: jest.fn().mockResolvedValue({ available: true }),
      confirmEmailChange: jest.fn().mockResolvedValue({ id: 1 }),
      requestEmailChange: jest.fn().mockResolvedValue(undefined),
    };
    controller = new UserController(service);
  });

  it('is defined', () => {
    expect(controller).toBeDefined();
  });

  describe('checkPseudo', () => {
    it('rejects a missing pseudo without hitting the service', async () => {
      const res = await controller.checkPseudo('', { user: { id: 1 } } as any);
      expect(res).toEqual({ available: false, reason: 'Pseudo manquant.' });
      expect(service.isPseudoAvailable).not.toHaveBeenCalled();
    });

    it('returns the format reason when the pseudo is malformed', async () => {
      service.validatePseudoFormat.mockReturnValue({
        valid: false,
        reason: 'trop court',
      });
      const res = await controller.checkPseudo('a', { user: { id: 1 } } as any);
      expect(res).toEqual({ available: false, reason: 'trop court' });
    });

    it('checks availability excluding the caller’s own id', async () => {
      await controller.checkPseudo('alice', { user: { id: 5 } } as any);
      expect(service.isPseudoAvailable).toHaveBeenCalledWith('alice', 5);
    });
  });

  describe('updateMe', () => {
    it('rejects a malformed pseudo with a 400', async () => {
      service.validatePseudoFormat.mockReturnValue({
        valid: false,
        reason: 'invalide',
      });

      await expect(
        controller.updateMe(
          { user: { id: 5 } } as any,
          { pseudo: '!!' },
          undefined,
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(service.update).not.toHaveBeenCalled();
    });

    it('rejects an already-taken pseudo with a 400', async () => {
      service.isPseudoAvailable.mockResolvedValue({ available: false });

      await expect(
        controller.updateMe(
          { user: { id: 5 } } as any,
          { pseudo: 'taken' },
          undefined,
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('updates only the caller’s own record', async () => {
      await controller.updateMe(
        { user: { id: 5 } } as any,
        { name: 'A', lastName: 'B', pseudo: 'ok' },
        undefined,
      );
      expect(service.update).toHaveBeenCalledWith(
        5,
        { name: 'A', lastName: 'B', pseudo: 'ok' },
        undefined,
      );
    });
  });

  describe('requestEmailChange', () => {
    it('rejects a missing address with a 400', async () => {
      await expect(
        controller.requestEmailChange({ user: { id: 5 } } as any, ''),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('delegates the change request for the caller', async () => {
      await controller.requestEmailChange(
        { user: { id: 5 } } as any,
        'new@x.y',
      );
      expect(service.requestEmailChange).toHaveBeenCalledWith(5, 'new@x.y');
    });
  });

  it('coerces the id for the admin findOne / update / remove routes', async () => {
    await controller.findOne('12');
    await controller.update('12', { name: 'X' } as any, undefined);
    await controller.remove('12');
    expect(service.findOne).toHaveBeenCalledWith(12);
    expect(service.update).toHaveBeenCalledWith(12, { name: 'X' }, undefined);
    expect(service.remove).toHaveBeenCalledWith(12);
  });
});
