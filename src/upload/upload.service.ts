import { Injectable } from '@nestjs/common';
import { unlink } from 'fs';
import { promisify } from 'util';

@Injectable()
export class UploadService {
  private unlinkAsync = promisify(unlink);

  async deleteFile(filePath: string) {
    try {
      await this.unlinkAsync(filePath);
    } catch (error) {
      throw new Error(`Could not delete file: ${error.message}`);
    }
  }
}
