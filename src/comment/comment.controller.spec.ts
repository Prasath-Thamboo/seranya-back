import { CommentController } from './comment.controller';

describe('CommentController', () => {
  let controller: CommentController;
  let service: any;

  beforeEach(() => {
    service = {
      create: jest.fn().mockResolvedValue({ id: 1 }),
      findByResource: jest.fn().mockResolvedValue([]),
      findAll: jest.fn().mockResolvedValue([]),
      update: jest.fn().mockResolvedValue({ id: 1 }),
      remove: jest.fn().mockResolvedValue({ id: 1 }),
    };
    controller = new CommentController(service);
  });

  it('passes the authenticated user id (from the token) to create', () => {
    controller.create(
      { content: 'hi', postId: 3 } as any,
      { user: { id: 9 } } as any,
    );
    expect(service.create).toHaveBeenCalledWith(
      { content: 'hi', postId: 3 },
      9,
    );
  });

  it('coerces numeric query params but leaves the uuid classId as a string', () => {
    controller.findByResource('3', '4', 'class-uuid', '5');
    expect(service.findByResource).toHaveBeenCalledWith(3, 4, 'class-uuid', 5);
  });

  it('passes undefined for missing resource filters', () => {
    controller.findByResource(undefined, undefined, undefined, undefined);
    expect(service.findByResource).toHaveBeenCalledWith(
      undefined,
      undefined,
      undefined,
      undefined,
    );
  });

  it('forwards id, dto, user id and role to update (ownership check lives in the service)', () => {
    controller.update(
      '12',
      { content: 'edit' } as any,
      { user: { id: 9, role: 'USER' } } as any,
    );
    expect(service.update).toHaveBeenCalledWith(
      12,
      { content: 'edit' },
      9,
      'USER',
    );
  });

  it('forwards id, user id and role to remove', () => {
    controller.remove('12', { user: { id: 9, role: 'ADMIN' } } as any);
    expect(service.remove).toHaveBeenCalledWith(12, 9, 'ADMIN');
  });
});
