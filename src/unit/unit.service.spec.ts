import { Test, TestingModule } from '@nestjs/testing';
import { UnitService } from './unit.service';
import { PrismaService } from '../prisma/prisma.service';
import { FileService } from '../files/file.service';

describe('UnitService', () => {
  let service: UnitService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UnitService,
        { provide: PrismaService, useValue: {} },
        { provide: FileService, useValue: {} },
      ],
    }).compile();

    service = module.get<UnitService>(UnitService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
