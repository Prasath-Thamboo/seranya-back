import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      notification: {
        create: jest.fn().mockResolvedValue({ id: 1 }),
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0),
        findUnique: jest.fn(),
        update: jest.fn().mockResolvedValue({ id: 1, isRead: true }),
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
    };
    service = new NotificationService(prisma);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('role-based visibility', () => {
    it('shows every notification type to an ADMIN (no type filter)', async () => {
      await service.findForRole('ADMIN' as any);

      expect(prisma.notification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: undefined }),
      );
    });

    it('restricts an EDITOR to COMMENT notifications', async () => {
      await service.findForRole('EDITOR' as any);

      expect(prisma.notification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { type: { in: ['COMMENT'] } } }),
      );
    });

    it('shows nothing to a plain USER', async () => {
      await service.findForRole('USER' as any);

      expect(prisma.notification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { type: { in: [] } } }),
      );
    });
  });

  describe('countUnreadForRole', () => {
    it('counts only unread COMMENT notifications for an EDITOR', async () => {
      await service.countUnreadForRole('EDITOR' as any);

      expect(prisma.notification.count).toHaveBeenCalledWith({
        where: { isRead: false, type: { in: ['COMMENT'] } },
      });
    });

    it('counts every unread notification for an ADMIN', async () => {
      await service.countUnreadForRole('ADMIN' as any);

      expect(prisma.notification.count).toHaveBeenCalledWith({
        where: { isRead: false },
      });
    });
  });

  describe('markAsRead', () => {
    it('throws NotFoundException for an unknown notification', async () => {
      prisma.notification.findUnique.mockResolvedValue(null);

      await expect(
        service.markAsRead(1, 'ADMIN' as any),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('forbids an EDITOR from marking a non-COMMENT notification', async () => {
      prisma.notification.findUnique.mockResolvedValue({
        id: 1,
        type: 'CONTACT',
      });

      await expect(
        service.markAsRead(1, 'EDITOR' as any),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(prisma.notification.update).not.toHaveBeenCalled();
    });

    it('lets an EDITOR mark a COMMENT notification as read', async () => {
      prisma.notification.findUnique.mockResolvedValue({
        id: 1,
        type: 'COMMENT',
      });

      await service.markAsRead(1, 'EDITOR' as any);

      expect(prisma.notification.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { isRead: true },
      });
    });

    it('lets an ADMIN mark any notification as read', async () => {
      prisma.notification.findUnique.mockResolvedValue({
        id: 1,
        type: 'GDPR_REQUEST',
      });

      await service.markAsRead(1, 'ADMIN' as any);

      expect(prisma.notification.update).toHaveBeenCalled();
    });
  });

  describe('markAllAsReadForRole', () => {
    it('scopes the bulk update to COMMENT notifications for an EDITOR', async () => {
      await service.markAllAsReadForRole('EDITOR' as any);

      expect(prisma.notification.updateMany).toHaveBeenCalledWith({
        where: { isRead: false, type: { in: ['COMMENT'] } },
        data: { isRead: true },
      });
    });

    it('updates all unread notifications for an ADMIN', async () => {
      await service.markAllAsReadForRole('ADMIN' as any);

      expect(prisma.notification.updateMany).toHaveBeenCalledWith({
        where: { isRead: false },
        data: { isRead: true },
      });
    });
  });
});
