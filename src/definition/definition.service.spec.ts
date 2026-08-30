import { NotFoundException } from '@nestjs/common';
import { DefinitionService } from './definition.service';

describe('DefinitionService', () => {
  let service: DefinitionService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      definition: {
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn(),
        create: jest.fn().mockResolvedValue({ id: 1 }),
        update: jest.fn().mockResolvedValue({ id: 1 }),
        delete: jest.fn().mockResolvedValue({ id: 1 }),
      },
    };
    service = new DefinitionService(prisma);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findPublished', () => {
    it('applies the publication filter for an unprivileged caller', async () => {
      await service.findPublished(false);

      const where = prisma.definition.findMany.mock.calls[0][0].where;
      expect(where.isPublished).toBe(true);
      expect(where.OR).toEqual([
        { publishedAt: null },
        { publishedAt: { lte: expect.any(Date) } },
      ]);
    });

    it('drops the filter for a privileged caller', async () => {
      await service.findPublished(true);

      expect(prisma.definition.findMany.mock.calls[0][0].where).toEqual({});
    });
  });

  describe('findOne', () => {
    it('throws NotFoundException when nothing matches (incl. hidden drafts)', async () => {
      prisma.definition.findFirst.mockResolvedValue(null);

      await expect(service.findOne(1, false)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('returns the definition when found', async () => {
      prisma.definition.findFirst.mockResolvedValue({ id: 1, term: 'Karma' });

      await expect(service.findOne(1, true)).resolves.toEqual({
        id: 1,
        term: 'Karma',
      });
    });
  });

  describe('create', () => {
    it('stores a null publishedAt when none is provided', async () => {
      await service.create({ term: 'Karma', definition: '...' } as any);

      expect(
        prisma.definition.create.mock.calls[0][0].data.publishedAt,
      ).toBeNull();
    });

    it('coerces a provided publishedAt string into a Date', async () => {
      await service.create({
        term: 'Karma',
        definition: '...',
        publishedAt: '2030-01-01T00:00:00.000Z',
      } as any);

      expect(
        prisma.definition.create.mock.calls[0][0].data.publishedAt,
      ).toBeInstanceOf(Date);
    });
  });

  describe('update', () => {
    it('leaves publishedAt untouched when the field is absent from the payload', async () => {
      await service.update(1, { term: 'Karma (rev.)' } as any);

      expect(prisma.definition.update.mock.calls[0][0].data).not.toHaveProperty(
        'publishedAt',
      );
    });

    it('clears publishedAt when it is explicitly null', async () => {
      await service.update(1, { publishedAt: null } as any);

      expect(
        prisma.definition.update.mock.calls[0][0].data.publishedAt,
      ).toBeNull();
    });
  });
});
