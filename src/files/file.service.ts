import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';
import { PrismaService } from '../prisma/prisma.service';
import { UploadType } from '@prisma/client';

@Injectable()
export class FileService {
  private readonly logger = new Logger(FileService.name);

  constructor(private readonly prisma: PrismaService) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadImage(file: Express.Multer.File, folder: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder, resource_type: 'image' },
        (error, result: UploadApiResponse) => {
          if (error || !result) {
            this.logger.error('Erreur upload Cloudinary', error);
            return reject(new InternalServerErrorException("Erreur lors de l'upload vers Cloudinary"));
          }
          resolve(result.secure_url);
        },
      );
      Readable.from(file.buffer).pipe(stream);
    });
  }

  async uploadProfileImage(file: Express.Multer.File, userId: number): Promise<string> {
    const publicId = `users/${userId}/profileImage`;
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { public_id: publicId, overwrite: true, resource_type: 'image' },
        (error, result: UploadApiResponse) => {
          if (error || !result) {
            this.logger.error('Erreur upload profil Cloudinary', error);
            return reject(new InternalServerErrorException("Erreur lors de l'upload de l'image de profil"));
          }
          resolve(result.secure_url);
        },
      );
      Readable.from(file.buffer).pipe(stream);
    });
  }

  async deleteImage(fileUrl: string): Promise<void> {
    const publicId = this.getPublicIdFromUrl(fileUrl);
    if (!publicId) return;
    try {
      await cloudinary.uploader.destroy(publicId);
      this.logger.log(`Image supprimée : ${publicId}`);
    } catch (error) {
      this.logger.error('Erreur suppression Cloudinary', error);
      throw new InternalServerErrorException("Erreur lors de la suppression de l'image");
    }
  }

  getPublicIdFromUrl(url: string): string {
    const parts = url.split('/upload/');
    if (parts.length < 2) return '';
    const afterUpload = parts[1].replace(/^v\d+\//, '');
    return afterUpload.replace(/\.[^/.]+$/, '');
  }

  async getRandomBackgroundImage(): Promise<string> {
    const images = await this.getGalleryImages();
    if (images.length === 0) {
      throw new InternalServerErrorException('Aucune image de fond trouvée.');
    }
    return images[Math.floor(Math.random() * images.length)];
  }

  async getRandomBackgroundImages(count: number): Promise<string[]> {
    const images = await this.getGalleryImages();
    if (images.length === 0) {
      throw new InternalServerErrorException('Aucune image de fond trouvée.');
    }
    return this.shuffleArray(images).slice(0, count);
  }

  private async getGalleryImages(): Promise<string[]> {
    const uploads = await this.prisma.upload.findMany({
      where: { type: UploadType.GALERY },
      select: { path: true },
    });
    return uploads.map((u) => u.path);
  }

  private shuffleArray<T>(array: T[]): T[] {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }
}
