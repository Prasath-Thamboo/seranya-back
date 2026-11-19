import { DefinitionController } from './definition.controller';

describe('DefinitionController', () => {
  let controller: DefinitionController;
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
    controller = new DefinitionController(service);
  });

  describe('privilege detection', () => {
    // Le dernier argument (lang résolu depuis ?lang) est undefined sans query.
    it('treats ADMIN and EDITOR as privileged', () => {
      controller.findPublished({ user: { role: 'ADMIN' } } as any);
      controller.findPublished({ user: { role: 'EDITOR' } } as any);
      expect(service.findPublished).toHaveBeenNthCalledWith(1, true, undefined);
      expect(service.findPublished).toHaveBeenNthCalledWith(2, true, undefined);
    });

    it('treats USER and anonymous requests as unprivileged', () => {
      controller.findPublished({ user: { role: 'USER' } } as any);
      controller.findPublished({} as any);
      expect(service.findPublished).toHaveBeenNthCalledWith(
        1,
        false,
        undefined,
      );
      expect(service.findPublished).toHaveBeenNthCalledWith(
        2,
        false,
        undefined,
      );
    });
  });

  it('coerces the id and forwards the privilege flag to findOne', () => {
    controller.findOne('15', { user: { role: 'USER' } } as any);
    expect(service.findOne).toHaveBeenCalledWith(15, false, undefined);
  });

  it('delegates create / update / remove with a coerced id', () => {
    controller.create({ term: 't', definition: 'd' } as any);
    controller.update('15', { term: 't2' } as any);
    controller.remove('15');
    expect(service.create).toHaveBeenCalledWith({ term: 't', definition: 'd' });
    expect(service.update).toHaveBeenCalledWith(15, { term: 't2' });
    expect(service.remove).toHaveBeenCalledWith(15);
  });
});
