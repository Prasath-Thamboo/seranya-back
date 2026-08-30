import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CommentService } from './comment.service';

describe('CommentService', () => {
  let service: CommentService;
  let prisma: any;
  let notification: any;

  beforeEach(() => {
    prisma = {
      comment: {
        create: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn(),
        update: jest.fn().mockResolvedValue({ id: 1 }),
        delete: jest.fn().mockResolvedValue({ id: 1 }),
      },
    };
    notification = { create: jest.fn().mockResolvedValue(undefined) };
    service = new CommentService(prisma, notification);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('binds the comment to the authenticated user and nulls the unset resources', async () => {
      prisma.comment.create.mockResolvedValue({
        id: 1,
        user: { pseudo: 'bob' },
        post: { title: 'Hello world' },
        unit: null,
        class: null,
        tutorial: null,
      });

      await service.create({ content: 'nice post', postId: 3 } as any, 7);

      expect(prisma.comment.create.mock.calls[0][0].data).toEqual({
        content: 'nice post',
        userId: 7,
        postId: 3,
        unitId: null,
        classId: null,
        tutorialId: null,
      });
    });

    it('raises a COMMENT notification naming the resource', async () => {
      prisma.comment.create.mockResolvedValue({
        id: 1,
        user: { pseudo: 'bob' },
        post: { title: 'Hello world' },
        unit: null,
        class: null,
        tutorial: null,
      });

      await service.create({ content: 'x', postId: 3 } as any, 7);

      expect(notification.create).toHaveBeenCalledWith(
        'COMMENT',
        'bob a commenté « Hello world »',
        '/admin/discussions',
      );
    });

    it('falls back to a generic message when no resource title is available', async () => {
      prisma.comment.create.mockResolvedValue({
        id: 1,
        user: { pseudo: 'bob' },
        post: null,
        unit: null,
        class: null,
        tutorial: null,
      });

      await service.create({ content: 'x' } as any, 7);

      expect(notification.create).toHaveBeenCalledWith(
        'COMMENT',
        'bob a posté un commentaire',
        '/admin/discussions',
      );
    });
  });

  describe('update', () => {
    it('throws NotFoundException for an unknown comment', async () => {
      prisma.comment.findUnique.mockResolvedValue(null);

      await expect(
        service.update(1, { content: 'x' } as any, 7, 'USER'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('forbids editing someone else’s comment when not an ADMIN', async () => {
      prisma.comment.findUnique.mockResolvedValue({ id: 1, userId: 99 });

      await expect(
        service.update(1, { content: 'x' } as any, 7, 'USER'),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(prisma.comment.update).not.toHaveBeenCalled();
    });

    it('lets the author edit their own comment', async () => {
      prisma.comment.findUnique.mockResolvedValue({ id: 1, userId: 7 });

      await service.update(1, { content: 'edited' } as any, 7, 'USER');

      expect(prisma.comment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1 },
          data: { content: 'edited' },
        }),
      );
    });

    it('lets an ADMIN edit any comment', async () => {
      prisma.comment.findUnique.mockResolvedValue({ id: 1, userId: 99 });

      await service.update(1, { content: 'moderated' } as any, 7, 'ADMIN');

      expect(prisma.comment.update).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('throws NotFoundException for an unknown comment', async () => {
      prisma.comment.findUnique.mockResolvedValue(null);

      await expect(service.remove(1, 7, 'USER')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('forbids deleting someone else’s comment when not an ADMIN', async () => {
      prisma.comment.findUnique.mockResolvedValue({ id: 1, userId: 99 });

      await expect(service.remove(1, 7, 'USER')).rejects.toBeInstanceOf(
        ForbiddenException,
      );
      expect(prisma.comment.delete).not.toHaveBeenCalled();
    });

    it('lets the author delete their own comment', async () => {
      prisma.comment.findUnique.mockResolvedValue({ id: 1, userId: 7 });

      await service.remove(1, 7, 'USER');

      expect(prisma.comment.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('lets an ADMIN delete any comment', async () => {
      prisma.comment.findUnique.mockResolvedValue({ id: 1, userId: 99 });

      await service.remove(1, 7, 'ADMIN');

      expect(prisma.comment.delete).toHaveBeenCalled();
    });
  });
});
