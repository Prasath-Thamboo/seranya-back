import { Test, TestingModule } from '@nestjs/testing';
import { ServiceUnavailableException } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

describe('AppController', () => {
  let appController: AppController;
  let prisma: { $queryRaw: jest.Mock };
  let appService: AppService;

  beforeEach(async () => {
    prisma = { $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]) };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });

  describe('health', () => {
    it('reports ok with a timestamp when the database answers', async () => {
      const result = await appController.health();
      expect(result.status).toBe('ok');
      expect(typeof result.timestamp).toBe('string');
    });

    it('throws ServiceUnavailableException when the database probe fails', async () => {
      prisma.$queryRaw.mockRejectedValue(new Error('ECONNREFUSED'));
      await expect(appController.health()).rejects.toBeInstanceOf(
        ServiceUnavailableException,
      );
    });
  });

  describe('search', () => {
    it('short-circuits to empty buckets for a query shorter than 2 characters', async () => {
      const spy = jest.spyOn(appService, 'search');

      await expect(appController.search('a')).resolves.toEqual({
        posts: [],
        tutorials: [],
        definitions: [],
        users: [],
      });
      await expect(appController.search(undefined as any)).resolves.toEqual({
        posts: [],
        tutorials: [],
        definitions: [],
        users: [],
      });
      expect(spy).not.toHaveBeenCalled();
    });

    it('delegates a trimmed query to the service', async () => {
      const spy = jest.spyOn(appService, 'search').mockResolvedValue({
        posts: [],
        tutorials: [],
        definitions: [],
        users: [],
      });

      await appController.search('  karma  ');

      expect(spy).toHaveBeenCalledWith('karma');
    });
  });
});
