import { TutorialController } from './tutorial.controller';

describe('TutorialController', () => {
  let controller: TutorialController;
  let service: any;

  beforeEach(() => {
    service = {
      findPublished: jest.fn().mockResolvedValue([]),
      findAll: jest.fn().mockResolvedValue([]),
      findOne: jest.fn().mockResolvedValue({ id: 1 }),
      create: jest.fn().mockResolvedValue({ id: 1 }),
      update: jest.fn().mockResolvedValue({ id: 1 }),
      remove: jest.fn().mockResolvedValue({ id: 1 }),
    };
    controller = new TutorialController(service);
  });

  describe('isPrivileged / canWatch flags passed to findPublished', () => {
    it('privileged (EDITOR) → both flags true', () => {
      controller.findPublished({ user: { role: 'EDITOR' } } as any);
      expect(service.findPublished).toHaveBeenCalledWith(true, true);
    });

    it('subscribed USER → not privileged but can watch', () => {
      controller.findPublished({
        user: { role: 'USER', isSubscribed: true },
      } as any);
      expect(service.findPublished).toHaveBeenCalledWith(false, true);
    });

    it('plain USER → not privileged, cannot watch', () => {
      controller.findPublished({
        user: { role: 'USER', isSubscribed: false },
      } as any);
      expect(service.findPublished).toHaveBeenCalledWith(false, false);
    });

    it('anonymous → not privileged, cannot watch', () => {
      controller.findPublished({} as any);
      expect(service.findPublished).toHaveBeenCalledWith(false, false);
    });
  });

  it('coerces the id and forwards both flags to findOne', () => {
    controller.findOne('9', {
      user: { role: 'USER', isSubscribed: true },
    } as any);
    expect(service.findOne).toHaveBeenCalledWith(9, false, true);
  });

  it('delegates create / update / remove with a coerced id', () => {
    controller.create({ title: 't', videoUrl: 'u' } as any);
    controller.update('9', { title: 't2' } as any);
    controller.remove('9');
    expect(service.create).toHaveBeenCalledWith({ title: 't', videoUrl: 'u' });
    expect(service.update).toHaveBeenCalledWith(9, { title: 't2' });
    expect(service.remove).toHaveBeenCalledWith(9);
  });
});
