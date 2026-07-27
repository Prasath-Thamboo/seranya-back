import { Controller, Get, Patch, Param, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { ApiBearerAuth } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RoleGuard } from '../auth/role.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('notifications')
@ApiBearerAuth()
@Roles('ADMIN', 'EDITOR')
@UseGuards(JwtAuthGuard, RoleGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  findAll(@Req() req: Request) {
    const user = req.user as any;
    return this.notificationService.findForRole(user.role);
  }

  @Get('unread-count')
  unreadCount(@Req() req: Request) {
    const user = req.user as any;
    return this.notificationService.countUnreadForRole(user.role);
  }

  @Patch('read-all')
  markAllAsRead(@Req() req: Request) {
    const user = req.user as any;
    return this.notificationService.markAllAsReadForRole(user.role);
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as any;
    return this.notificationService.markAsRead(+id, user.role);
  }
}
