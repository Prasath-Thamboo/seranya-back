import { BadRequestException } from '@nestjs/common';
import { PostService } from './post.service';

describe('PostService', () => {
  let service: PostService;
  let prisma: any;
  let fileService: any;

  beforeEach(() => {
    prisma = {
      post: {
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
      },
    };
    fileService = {};
    service = new PostService(prisma, fileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('publication filtering', () => {
    it('hides drafts and future posts from unprivileged callers', async () => {
      await service.findAll(false);

      const where = prisma.post.findMany.mock.calls[0][0].where;
      expect(where.isPublished).toBe(true);
      expect(where.OR).toEqual([
        { publishedAt: null },
        { publishedAt: { lte: expect.any(Date) } },
      ]);
    });

    it('returns everything for a privileged (EDITOR/ADMIN) caller', async () => {
      await service.findAll(true);

      expect(prisma.post.findMany.mock.calls[0][0].where).toEqual({});
    });

    it('applies the publication filter alongside the REGION type filter', async () => {
      await service.findAllRegions(false);

      const where = prisma.post.findMany.mock.calls[0][0].where;
      expect(where.type).toBe('REGION');
      expect(where.isPublished).toBe(true);
    });
  });

  describe('findOne', () => {
    it('throws BadRequestException when the post is missing or not visible', async () => {
      prisma.post.findFirst.mockResolvedValue(null);

      await expect(service.findOne(1, false)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('flattens uploads into profile/header/footer/gallery fields', async () => {
      prisma.post.findFirst.mockResolvedValue({
        id: 1,
        uploads: [
          { type: 'PROFILEIMAGE', path: 'profile.jpg' },
          { type: 'HEADERIMAGE', path: 'header.jpg' },
          { type: 'GALERY', path: 'g1.jpg' },
          { type: 'GALERY', path: 'g2.jpg' },
        ],
      });

      const post: any = await service.findOne(1, true);

      expect(post.profileImage).toBe('profile.jpg');
      expect(post.headerImage).toBe('header.jpg');
      expect(post.footerImage).toBeNull();
      expect(post.gallery).toEqual(['g1.jpg', 'g2.jpg']);
    });
  });

  describe('getAllRegionIds', () => {
    it('returns the bare list of REGION post ids', async () => {
      prisma.post.findMany.mockResolvedValue([{ id: 2 }, { id: 5 }, { id: 8 }]);

      await expect(service.getAllRegionIds()).resolves.toEqual([2, 5, 8]);
      expect(prisma.post.findMany).toHaveBeenCalledWith({
        where: { type: 'REGION' },
        select: { id: true },
      });
    });
  });
});
