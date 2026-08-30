import { InternalServerErrorException } from '@nestjs/common';
import { UnitService } from './unit.service';

describe('UnitService', () => {
  let service: UnitService;
  let prisma: any;
  let fileService: any;

  beforeEach(() => {
    prisma = {
      unit: {
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn(),
        create: jest.fn().mockResolvedValue({ id: 1 }),
        update: jest.fn().mockResolvedValue({ id: 1 }),
        delete: jest.fn().mockResolvedValue({ id: 1 }),
      },
      user: { findUnique: jest.fn() },
      userUnit: { deleteMany: jest.fn() },
      upload: { findMany: jest.fn().mockResolvedValue([]), delete: jest.fn() },
    };
    fileService = { uploadImage: jest.fn(), deleteImage: jest.fn() };
    service = new UnitService(prisma, fileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('returns null (no throw) when the unit is absent', async () => {
      prisma.unit.findUnique.mockResolvedValue(null);

      await expect(service.findOne(1)).resolves.toBeNull();
    });

    it('flattens uploads into the image fields', async () => {
      prisma.unit.findUnique.mockResolvedValue({
        id: 1,
        uploads: [
          { type: 'PROFILEIMAGE', path: 'p.jpg' },
          { type: 'GALERY', path: 'g1.jpg' },
          { type: 'GALERY', path: 'g2.jpg' },
        ],
        classes: [],
      });

      const unit: any = await service.findOne(1);

      expect(unit.profileImage).toBe('p.jpg');
      expect(unit.headerImage).toBeNull();
      expect(unit.gallery).toEqual(['g1.jpg', 'g2.jpg']);
    });
  });

  describe('create', () => {
    it('fails (wrapped 500) when the author id does not resolve to a user', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.create({ title: 'T', intro: 'I', type: 'UNIT' } as any, 999),
      ).rejects.toBeInstanceOf(InternalServerErrorException);
      expect(prisma.unit.create).not.toHaveBeenCalled();
    });

    it('sanitises story/bio, links the author, and skips the file service with no images', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 7 });
      prisma.unit.findUnique.mockResolvedValue({
        id: 1,
        uploads: [],
        classes: [],
      });

      const result: any = await service.create(
        {
          title: 'T',
          intro: 'I',
          type: 'UNIT',
          story: '<p>hi</p><script>x()</script>',
          bio: '<em>b</em>',
        } as any,
        7,
      );

      const data = prisma.unit.create.mock.calls[0][0].data;
      expect(data.story).toBe('<p>hi</p>');
      expect(data.bio).toBe('<em>b</em>');
      expect(data.users).toEqual({ create: { userId: 7 } });
      expect(fileService.uploadImage).not.toHaveBeenCalled();
      expect(result.gallery).toEqual([]);
    });
  });

  describe('lookups by relation', () => {
    it('filters units by the membership of a user', async () => {
      await service.findUnitsByUser(7);
      expect(prisma.unit.findMany).toHaveBeenCalledWith({
        where: { users: { some: { userId: 7 } } },
      });
    });

    it('filters units by a class id', async () => {
      await service.findUnitsByClass('class-uuid');
      expect(prisma.unit.findMany).toHaveBeenCalledWith({
        where: { classes: { some: { id: 'class-uuid' } } },
      });
    });
  });
});
