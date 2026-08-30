import { HttpException } from '@nestjs/common';
import { UnitController } from './unit.controller';

describe('UnitController', () => {
  let controller: UnitController;
  let service: any;

  beforeEach(() => {
    service = {
      findAll: jest.fn().mockResolvedValue([]),
      findOne: jest.fn().mockResolvedValue({ id: 1 }),
      findUnitsByUser: jest.fn().mockResolvedValue([]),
      findUnitsByClass: jest.fn().mockResolvedValue([]),
      create: jest.fn().mockResolvedValue({ id: 1 }),
      update: jest.fn().mockResolvedValue({ id: 1 }),
      remove: jest.fn().mockResolvedValue({ id: 1 }),
      deleteGalleryImage: jest.fn().mockResolvedValue({ id: 1 }),
    };
    controller = new UnitController(service);
  });

  it('is defined', () => {
    expect(controller).toBeDefined();
  });

  it('coerces numeric ids but keeps the uuid classId as a string', () => {
    controller.findOne('3');
    controller.findUnitsByUser('7');
    controller.findUnitsByClass('class-uuid');
    expect(service.findOne).toHaveBeenCalledWith(3);
    expect(service.findUnitsByUser).toHaveBeenCalledWith(7);
    expect(service.findUnitsByClass).toHaveBeenCalledWith('class-uuid');
  });

  describe('create', () => {
    it('rejects an unauthenticated request with a 401 before touching the service', async () => {
      await expect(
        controller.create(
          { user: undefined } as any,
          {} as any,
          { title: 'X' } as any,
        ),
      ).rejects.toBeInstanceOf(HttpException);
      expect(service.create).not.toHaveBeenCalled();
    });

    it('passes the author id from the token and the unwrapped files', async () => {
      const files = {
        profileImage: [{ originalname: 'p', size: 1 }],
        gallery: [{ originalname: 'g' }],
      };

      await controller.create(
        { user: { id: 9 } } as any,
        files as any,
        { title: 'X' } as any,
      );

      expect(service.create).toHaveBeenCalledWith(
        { title: 'X' },
        9,
        { originalname: 'p', size: 1 },
        undefined,
        undefined,
        [{ originalname: 'g' }],
      );
    });

    it('maps a Prisma P2002 (unique) error to a 400', async () => {
      service.create.mockRejectedValue({ code: 'P2002', message: 'dup' });

      await expect(
        controller.create(
          { user: { id: 9 } } as any,
          {} as any,
          { title: 'X' } as any,
        ),
      ).rejects.toMatchObject({ status: 400 });
    });

    it('maps a Prisma P2025 (not found) error to a 404', async () => {
      service.create.mockRejectedValue({ code: 'P2025', message: 'missing' });

      await expect(
        controller.create(
          { user: { id: 9 } } as any,
          {} as any,
          { title: 'X' } as any,
        ),
      ).rejects.toMatchObject({ status: 404 });
    });
  });

  it('coerces the id on remove and deleteGalleryImage', async () => {
    await controller.remove('3');
    await controller.deleteGalleryImage('88');
    expect(service.remove).toHaveBeenCalledWith(3);
    expect(service.deleteGalleryImage).toHaveBeenCalledWith(88);
  });
});
