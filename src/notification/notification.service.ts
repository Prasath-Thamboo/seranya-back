import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { NotificationType, Role, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

// EDITOR ne voit que les notifications de commentaires ; ADMIN voit tout.
const visibleTypesForRole = (role: Role): NotificationType[] | null => {
  if (role === 'ADMIN') return null; // null = pas de filtre, tout est visible
  if (role === 'EDITOR') return ['COMMENT'];
  return [];
};

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  async create(type: NotificationType, message: string, link?: string) {
    return this.prisma.notification.create({
      data: { type, message, link },
    });
  }

  async findForRole(role: Role) {
    const types = visibleTypesForRole(role);
    return this.prisma.notification.findMany({
      where: types ? { type: { in: types } } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async countUnreadForRole(role: Role) {
    const types = visibleTypesForRole(role);
    const where: Prisma.NotificationWhereInput = {
      isRead: false,
      ...(types ? { type: { in: types } } : {}),
    };
    return this.prisma.notification.count({ where });
  }

  async markAsRead(id: number, role: Role) {
    const notification = await this.prisma.notification.findUnique({ where: { id } });
    if (!notification) throw new NotFoundException('Notification introuvable');

    const types = visibleTypesForRole(role);
    if (types && !types.includes(notification.type)) {
      throw new ForbiddenException('Action non autorisée');
    }

    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllAsReadForRole(role: Role) {
    const types = visibleTypesForRole(role);
    await this.prisma.notification.updateMany({
      where: {
        isRead: false,
        ...(types ? { type: { in: types } } : {}),
      },
      data: { isRead: true },
    });
    return { success: true };
  }
}
