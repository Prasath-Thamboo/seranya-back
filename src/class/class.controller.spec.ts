import { ClassController } from './class.controller';

describe('ClassController', () => {
  let controller: ClassController;
  let service: any;

  beforeEach(() => {
    service = {
      findAll: jest.fn().mockResolvedValue([]),
      findOne: jest.fn().mockResolvedValue({ id: 'c1' }),
      create: jest.fn().mockResolvedValue({ id: 'c1' }),
      update: jest.fn().mockResolvedValue({ id: 'c1' }),
      remove: jest.fn().mockResolvedValue({ id: 'c1' }),
    };
    controller = new ClassController(service);
  });

  it('is defined', () => {
    expect(controller).toBeDefined();
  });

  it('keeps the uuid id as a string for findOne / remove', async () => {
    await controller.findOne('c1-uuid');
    await controller.remove('c1-uuid');
    expect(service.findOne).toHaveBeenCalledWith('c1-uuid');
    expect(service.remove).toHaveBeenCalledWith('c1-uuid');
  });

  it('unwraps the first file of each field and defaults the gallery to an empty array on create', async () => {
    const files = {
      profileImage: [{ originalname: 'p' }],
      gallery: [{ originalname: 'g1' }],
    };

    await controller.create({} as any, files as any, { title: 'X' } as any);

    expect(service.create).toHaveBeenCalledWith(
      { title: 'X' },
      { originalname: 'p' },
      undefined,
      undefined,
      [{ originalname: 'g1' }],
    );
  });

  it('forwards galleryImagesToDelete from the dto on update', async () => {
    await controller.update(
      'c1',
      {} as any,
      {} as any,
      { title: 'X', galleryImagesToDelete: ['5'] } as any,
    );

    expect(service.update).toHaveBeenCalledWith(
      'c1',
      { title: 'X', galleryImagesToDelete: ['5'] },
      undefined,
      undefined,
      undefined,
      [],
      ['5'],
    );
  });
});
