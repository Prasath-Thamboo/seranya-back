import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ClassService } from './class.service';

describe('ClassService', () => {
  let service: ClassService;
  let prisma: any;
  let fileService: any;

  beforeEach(() => {
    prisma = {
      class: {
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn(),
        create: jest.fn().mockResolvedValue({ id: 'c1' }),
        update: jest.fn().mockResolvedValue({ id: 'c1' }),
        delete: jest.fn().mockResolvedValue({ id: 'c1' }),
      },
      upload: {
        delete: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
      },
    };
    fileService = { uploadImage: jest.fn(), deleteImage: jest.fn() };
    service = new ClassService(prisma, fileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('throws BadRequestException when the class does not exist', async () => {
      prisma.class.findUnique.mockResolvedValue(null);

      await expect(service.findOne('missing')).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('exposes gallery paths and their upload ids', async () => {
      prisma.class.findUnique.mockResolvedValue({
        id: 'c1',
        uploads: [
          { id: 10, type: 'GALERY', path: 'g1.jpg' },
          { id: 11, type: 'GALERY', path: 'g2.jpg' },
          { id: 12, type: 'PROFILEIMAGE', path: 'p.jpg' },
        ],
        units: [],
      });

      const result: any = await service.findOne('c1');

      expect(result.gallery).toEqual(['g1.jpg', 'g2.jpg']);
      expect(result.galleryUploadIds).toEqual([10, 11]);
    });
  });

  describe('create', () => {
    it('sanitises story/bio and does not touch the file service when no image is provided', async () => {
      await service.create({
        title: 'T',
        intro: 'I',
        story: '<p>ok</p><script>bad()</script>',
        bio: '<b>bio</b>',
      } as any);

      const data = prisma.class.create.mock.calls[0][0].data;
      expect(data.story).toBe('<p>ok</p>');
      expect(data.bio).toBe('<b>bio</b>');
      expect(fileService.uploadImage).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('surfaces a missing class as a wrapped 500 (BadRequest is caught by handleException)', async () => {
      prisma.class.findUnique.mockResolvedValue(null);

      await expect(service.remove('missing')).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );
      expect(prisma.class.delete).not.toHaveBeenCalled();
    });
  });
});
