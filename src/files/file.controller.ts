// spectral5.0/src/files/file.controller.ts

import { Controller, Get, Res, HttpStatus, Query } from '@nestjs/common';
import { FileService } from './file.service';
import { Response } from 'express';

@Controller('api')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Get('random-background')
  async getRandomBackground(@Res() res: Response) {
    try {
      const imageUrl = await this.fileService.getRandomBackgroundImage();
      res.status(HttpStatus.OK).json({ imageUrl });
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: error.message });
    }
  }

  @Get('random-backgrounds')
  async getRandomBackgrounds(
    @Res() res: Response,
    @Query('count') count: string,
  ) {
    try {
      const countNumber = parseInt(count, 10);
      const validCount =
        isNaN(countNumber) || countNumber <= 0 ? 5 : countNumber; // Par défaut 5
      const imageUrls =
        await this.fileService.getRandomBackgroundImages(validCount);
      res.status(HttpStatus.OK).json({ imageUrls });
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: error.message });
    }
  }
}
