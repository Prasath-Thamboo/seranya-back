import { NotificationController } from './notification.controller';

describe('NotificationController', () => {
  let controller: NotificationController;
  let service: any;

  beforeEach(() => {
    service = {
      findForRole: jest.fn().mockResolvedValue([]),
      countUnreadForRole: jest.fn().mockResolvedValue(0),
      markAllAsReadForRole: jest.fn().mockResolvedValue({ success: true }),
      markAsRead: jest.fn().mockResolvedValue({ id: 1, isRead: true }),
    };
    controller = new NotificationController(service);
  });

  it('scopes the listing to the caller role', () => {
    controller.findAll({ user: { role: 'EDITOR' } } as any);
    expect(service.findForRole).toHaveBeenCalledWith('EDITOR');
  });

  it('scopes the unread count to the caller role', () => {
    controller.unreadCount({ user: { role: 'ADMIN' } } as any);
    expect(service.countUnreadForRole).toHaveBeenCalledWith('ADMIN');
  });

  it('scopes the bulk read to the caller role', () => {
    controller.markAllAsRead({ user: { role: 'EDITOR' } } as any);
    expect(service.markAllAsReadForRole).toHaveBeenCalledWith('EDITOR');
  });

  it('coerces the id and passes the caller role to markAsRead', () => {
    controller.markAsRead('42', { user: { role: 'EDITOR' } } as any);
    expect(service.markAsRead).toHaveBeenCalledWith(42, 'EDITOR');
  });
});
