import { HttpStatus } from '@nestjs/common';
import { FileController } from './file.controller';

describe('FileController', () => {
  let controller: FileController;
  let service: any;
  let res: any;

  beforeEach(() => {
    service = {
      getRandomBackgroundImage: jest.fn(),
      getRandomBackgroundImages: jest.fn(),
    };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    controller = new FileController(service);
  });

  describe('random-background', () => {
    it('returns the image url with a 200', async () => {
      service.getRandomBackgroundImage.mockResolvedValue('https://cdn/x.jpg');

      await controller.getRandomBackground(res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({ imageUrl: 'https://cdn/x.jpg' });
    });

    it('answers 500 with the error message on failure', async () => {
      service.getRandomBackgroundImage.mockRejectedValue(
        new Error('bucket unreachable'),
      );

      await controller.getRandomBackground(res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(res.json).toHaveBeenCalledWith({ error: 'bucket unreachable' });
    });
  });

  describe('random-backgrounds', () => {
    it('passes a valid positive count through', async () => {
      service.getRandomBackgroundImages.mockResolvedValue([]);

      await controller.getRandomBackgrounds(res, '3');

      expect(service.getRandomBackgroundImages).toHaveBeenCalledWith(3);
    });

    it('defaults to 5 for a non-numeric count', async () => {
      service.getRandomBackgroundImages.mockResolvedValue([]);

      await controller.getRandomBackgrounds(res, 'abc');

      expect(service.getRandomBackgroundImages).toHaveBeenCalledWith(5);
    });

    it('defaults to 5 for a zero or negative count', async () => {
      service.getRandomBackgroundImages.mockResolvedValue([]);

      await controller.getRandomBackgrounds(res, '0');
      await controller.getRandomBackgrounds(res, '-4');

      expect(service.getRandomBackgroundImages).toHaveBeenNthCalledWith(1, 5);
      expect(service.getRandomBackgroundImages).toHaveBeenNthCalledWith(2, 5);
    });
  });
});
