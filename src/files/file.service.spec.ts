jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      upload_stream: jest.fn(),
      destroy: jest.fn().mockResolvedValue({ result: 'ok' }),
    },
  },
}));

import { Writable } from 'stream';
import { InternalServerErrorException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { FileService } from './file.service';

describe('FileService', () => {
  let service: FileService;
  let prisma: any;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma = { upload: { findMany: jest.fn().mockResolvedValue([]) } };
    service = new FileService(prisma);
  });

  describe('getPublicIdFromUrl', () => {
    it('strips the /upload/ prefix, the version segment and the extension', () => {
      const url =
        'https://res.cloudinary.com/demo/image/upload/v1699999999/classes/5/profileImage.jpg';
      expect(service.getPublicIdFromUrl(url)).toBe('classes/5/profileImage');
    });

    it('returns an empty string for a URL without an /upload/ segment', () => {
      expect(service.getPublicIdFromUrl('https://example.com/img.png')).toBe(
        '',
      );
    });
  });

  describe('uploadImage', () => {
    it('resolves with the secure_url returned by Cloudinary', async () => {
      (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
        (_opts, cb) => {
          cb(null, { secure_url: 'https://res.cloudinary.com/demo/x.jpg' });
          return new Writable({ write: (_c, _e, done) => done() });
        },
      );

      await expect(
        service.uploadImage({ buffer: Buffer.from('x') } as any, 'folder'),
      ).resolves.toBe('https://res.cloudinary.com/demo/x.jpg');
    });

    it('rejects with InternalServerErrorException when Cloudinary errors', async () => {
      (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
        (_opts, cb) => {
          cb(new Error('cloudinary down'), undefined);
          return new Writable({ write: (_c, _e, done) => done() });
        },
      );

      await expect(
        service.uploadImage({ buffer: Buffer.from('x') } as any, 'folder'),
      ).rejects.toBeInstanceOf(InternalServerErrorException);
    });
  });

  describe('deleteImage', () => {
    it('calls Cloudinary destroy with the derived public id', async () => {
      await service.deleteImage(
        'https://res.cloudinary.com/demo/image/upload/v1/posts/3/headerImage.png',
      );
      expect(cloudinary.uploader.destroy).toHaveBeenCalledWith(
        'posts/3/headerImage',
      );
    });

    it('does nothing when the URL has no public id', async () => {
      await service.deleteImage('https://example.com/plain.png');
      expect(cloudinary.uploader.destroy).not.toHaveBeenCalled();
    });
  });

  describe('random background images', () => {
    it('throws when there is no gallery image at all', async () => {
      prisma.upload.findMany.mockResolvedValue([]);

      await expect(service.getRandomBackgroundImage()).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );
      await expect(service.getRandomBackgroundImages(3)).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );
    });

    it('returns one of the gallery paths for the single-image endpoint', async () => {
      prisma.upload.findMany.mockResolvedValue([
        { path: 'a' },
        { path: 'b' },
        { path: 'c' },
      ]);

      expect(['a', 'b', 'c']).toContain(
        await service.getRandomBackgroundImage(),
      );
    });

    it('returns at most `count` distinct paths for the multi-image endpoint', async () => {
      prisma.upload.findMany.mockResolvedValue(
        ['a', 'b', 'c', 'd', 'e'].map((path) => ({ path })),
      );

      const picked = await service.getRandomBackgroundImages(3);

      expect(picked).toHaveLength(3);
      expect(new Set(picked).size).toBe(3);
      picked.forEach((p) => expect(['a', 'b', 'c', 'd', 'e']).toContain(p));
    });

    it('only looks at GALERY-type uploads', async () => {
      await service.getRandomBackgroundImages(2).catch(() => undefined);

      expect(prisma.upload.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { type: 'GALERY' } }),
      );
    });
  });
});
