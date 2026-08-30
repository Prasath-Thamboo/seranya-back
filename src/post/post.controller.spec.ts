import { PostController } from './post.controller';

describe('PostController', () => {
  let controller: PostController;
  let service: any;

  beforeEach(() => {
    service = {
      findAll: jest.fn().mockResolvedValue([]),
      findAllRegions: jest.fn().mockResolvedValue([]),
      findOne: jest.fn().mockResolvedValue({ id: 1 }),
      create: jest.fn().mockResolvedValue({ id: 1 }),
      update: jest.fn().mockResolvedValue({ id: 1 }),
      remove: jest.fn().mockResolvedValue(undefined),
    };
    controller = new PostController(service);
  });

  it('passes the privilege flag to findAll / findAllRegions', () => {
    controller.findAll({ user: { role: 'ADMIN' } } as any);
    controller.findAllRegions({} as any);
    expect(service.findAll).toHaveBeenCalledWith(true);
    expect(service.findAllRegions).toHaveBeenCalledWith(false);
  });

  it('coerces the id and forwards the privilege flag to findOne', () => {
    controller.findOne('7', { user: { role: 'EDITOR' } } as any);
    expect(service.findOne).toHaveBeenCalledWith(7, true);
  });

  it('normalises scalar unitIds / classIds / galleryImagesToDelete into arrays on update', async () => {
    const dto: any = {
      unitIds: '3',
      classIds: 'c1',
      galleryImagesToDelete: '99',
      title: 'x',
    };

    await controller.update(
      '7',
      { user: { role: 'EDITOR' } } as any,
      {} as any,
      dto,
    );

    expect(dto.unitIds).toEqual(['3']);
    expect(dto.classIds).toEqual(['c1']);
    expect(dto.galleryImagesToDelete).toEqual(['99']);
    expect(service.update).toHaveBeenCalledWith(
      7,
      dto,
      undefined,
      undefined,
      undefined,
      [],
      ['99'],
    );
  });

  it('leaves already-array fields untouched on update', async () => {
    const dto: any = { unitIds: ['3', '4'] };

    await controller.update('7', { user: {} } as any, {} as any, dto);

    expect(dto.unitIds).toEqual(['3', '4']);
  });

  it('coerces the id on remove', async () => {
    await controller.remove('7');
    expect(service.remove).toHaveBeenCalledWith(7);
  });
});
