import { NotFoundException } from '@nestjs/common';
import { TutorialService } from './tutorial.service';

describe('TutorialService', () => {
  let service: TutorialService;
  let prisma: any;

  const YT_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
  const YT_THUMB = 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg';

  beforeEach(() => {
    prisma = {
      tutorial: {
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn(),
        create: jest.fn().mockResolvedValue({ id: 1 }),
        update: jest.fn().mockResolvedValue({ id: 1 }),
        delete: jest.fn().mockResolvedValue({ id: 1 }),
      },
    };
    service = new TutorialService(prisma);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('access control on the video URL', () => {
    it('hides the video URL and exposes only a thumbnail for a caller who cannot watch', async () => {
      prisma.tutorial.findFirst.mockResolvedValue({
        id: 1,
        title: 'Intro',
        videoUrl: YT_URL,
      });

      const result: any = await service.findOne(1, false, false);

      expect(result.videoUrl).toBeNull();
      expect(result.thumbnailUrl).toBe(YT_THUMB);
    });

    it('exposes the real video URL for a subscriber / privileged caller', async () => {
      prisma.tutorial.findFirst.mockResolvedValue({
        id: 1,
        title: 'Intro',
        videoUrl: YT_URL,
      });

      const result: any = await service.findOne(1, false, true);

      expect(result.videoUrl).toBe(YT_URL);
      expect(result.thumbnailUrl).toBe(YT_THUMB);
    });

    it('applies the same rule to every item of the published list', async () => {
      prisma.tutorial.findMany.mockResolvedValue([
        { id: 1, videoUrl: YT_URL },
        { id: 2, videoUrl: 'https://youtu.be/abcdefghijk' },
      ]);

      const list: any[] = await service.findPublished(false, false);

      expect(list.every((t) => t.videoUrl === null)).toBe(true);
      expect(list[0].thumbnailUrl).toBe(YT_THUMB);
      expect(list[1].thumbnailUrl).toBe(
        'https://img.youtube.com/vi/abcdefghijk/hqdefault.jpg',
      );
    });

    it('returns a null thumbnail for a non-YouTube URL', async () => {
      prisma.tutorial.findFirst.mockResolvedValue({
        id: 1,
        videoUrl: 'https://vimeo.com/123456789',
      });

      const result: any = await service.findOne(1, true, true);

      expect(result.thumbnailUrl).toBeNull();
    });
  });

  describe('findPublished', () => {
    it('applies the publication filter for an unprivileged caller', async () => {
      await service.findPublished(false, false);

      expect(prisma.tutorial.findMany.mock.calls[0][0].where.isPublished).toBe(
        true,
      );
    });

    it('drops the publication filter for a privileged caller', async () => {
      await service.findPublished(true, true);

      expect(prisma.tutorial.findMany.mock.calls[0][0].where).toEqual({});
    });
  });

  describe('findOne', () => {
    it('throws NotFoundException when nothing matches', async () => {
      prisma.tutorial.findFirst.mockResolvedValue(null);

      await expect(service.findOne(1, false, false)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('coerces a provided publishedAt string into a Date, null otherwise', async () => {
      await service.create({ title: 't', videoUrl: YT_URL } as any);
      expect(
        prisma.tutorial.create.mock.calls[0][0].data.publishedAt,
      ).toBeNull();

      await service.create({
        title: 't',
        videoUrl: YT_URL,
        publishedAt: '2030-01-01T00:00:00.000Z',
      } as any);
      expect(
        prisma.tutorial.create.mock.calls[1][0].data.publishedAt,
      ).toBeInstanceOf(Date);
    });
  });
});
