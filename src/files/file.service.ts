// spectral5.0/src/files/file.service.ts

import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FileService {
  private readonly logger = new Logger(FileService.name);
  public readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor(
    private readonly prisma: PrismaService, // Injection de PrismaService
  ) {
    this.s3Client = new S3Client({
      region: process.env.AWS_S3_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
    this.bucketName = process.env.AWS_S3_BUCKET_NAME;
  }

  // Fonction pour uploader une image sur S3
  async uploadImage(
    file: Express.Multer.File,
    folder: string,
  ): Promise<string> {
    this.logger.log(`Uploading image to folder: ${folder}`);

    if (!file || !file.buffer) {
      this.logger.error('Fichier non reçu ou fichier buffer manquant');
      throw new InternalServerErrorException(
        'Erreur lors de la réception du fichier',
      );
    }

    const fileExtension = extname(file.originalname).toLowerCase();
    const fileName = `${folder}/${uuidv4()}${fileExtension}`;

    let contentType = 'application/octet-stream';
    if (fileExtension === '.jpg' || fileExtension === '.jpeg') {
      contentType = 'image/jpeg';
    } else if (fileExtension === '.png') {
      contentType = 'image/png';
    } else if (fileExtension === '.pdf') {
      contentType = 'application/pdf';
    }

    const params = {
      Bucket: this.bucketName,
      Key: fileName,
      Body: file.buffer,
      ContentType: contentType,
    };

    try {
      await this.s3Client.send(new PutObjectCommand(params));
      const fileUrl = `https://${this.bucketName}.s3.amazonaws.com/${fileName}`;
      this.logger.log(`File uploaded successfully: ${fileUrl}`);
      return fileUrl;
    } catch (error) {
      this.logger.error(
        'Erreur lors du téléchargement du fichier vers S3',
        error,
      );
      throw new InternalServerErrorException(
        "Erreur lors de l'envoi du fichier à S3",
      );
    }
  }

  // Fonction pour supprimer une image depuis S3
  async deleteImage(fileKey: string) {
    const params = {
      Bucket: this.bucketName,
      Key: fileKey,
    };

    try {
      await this.s3Client.send(new DeleteObjectCommand(params));
      this.logger.log(`Fichier supprimé avec succès : ${fileKey}`);
    } catch (error) {
      this.logger.error(
        'Erreur lors de la suppression du fichier depuis S3',
        error,
      );
      throw new InternalServerErrorException(
        'Erreur lors de la suppression du fichier depuis S3',
      );
    }
  }

  // Nouvelle méthode pour lister toutes les images dans plusieurs dossiers
  async listImagesFromFolders(folders: string[]): Promise<string[]> {
    const allImages: string[] = [];

    for (const folder of folders) {
      const params = {
        Bucket: this.bucketName,
        Prefix: folder,
      };

      try {
        const data = await this.s3Client.send(new ListObjectsV2Command(params));
        if (data.Contents) {
          const images = data.Contents.filter(
            (item) => !item.Key.endsWith('/'),
          ).map((item) => item.Key);
          allImages.push(...images);
        }
      } catch (error) {
        this.logger.error(
          `Erreur lors du listage des images dans le dossier ${folder}`,
          error,
        );
        throw new InternalServerErrorException(
          `Erreur lors du listage des images dans le dossier ${folder}`,
        );
      }
    }

    return allImages;
  }

  // Nouvelle méthode pour obtenir une image de fond aléatoire
  async getRandomBackgroundImage(): Promise<string> {
    try {
      // Récupérer les IDs des units, classes, regions directement via PrismaService
      const units = await this.prisma.unit.findMany({ select: { id: true } });
      const unitIds = units.map((unit) => unit.id);

      const classes = await this.prisma.class.findMany({
        select: { id: true },
      });
      const classIds = classes.map((cls) => cls.id);

      const regions = await this.prisma.post.findMany({
        where: { type: 'REGION' }, // Assurez-vous que 'REGION' correspond à vos valeurs Enum
        select: { id: true },
      });
      const regionIds = regions.map((region) => region.id);

      const folders: string[] = [];

      // Ajouter les dossiers gallery des units
      unitIds.forEach((id) => {
        folders.push(`units/${id}/gallery/`);
      });

      // Ajouter les dossiers gallery des classes
      classIds.forEach((id) => {
        folders.push(`classes/${id}/gallery/`);
      });

      // Ajouter les dossiers gallery des regions
      regionIds.forEach((id) => {
        folders.push(`regions/${id}/gallery/`);
      });

      const images = await this.listImagesFromFolders(folders);

      if (images.length === 0) {
        throw new InternalServerErrorException('Aucune image de fond trouvée.');
      }

      const randomImage = images[Math.floor(Math.random() * images.length)];

      // Générer une URL signée pour l'image
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: randomImage,
      });

      const signedUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn: 60 * 60, // 1 heure
      });

      return signedUrl;
    } catch (error) {
      this.logger.error(
        "Erreur lors de la récupération de l'image de fond aléatoire",
        error,
      );
      throw new InternalServerErrorException(
        "Erreur lors de la récupération de l'image de fond aléatoire",
      );
    }
  }

  // **Nouvelle méthode pour obtenir plusieurs images de fond aléatoires**
  async getRandomBackgroundImages(count: number): Promise<string[]> {
    try {
      // Récupérer les IDs des units, classes, regions directement via PrismaService
      const units = await this.prisma.unit.findMany({ select: { id: true } });
      const unitIds = units.map((unit) => unit.id);

      const classes = await this.prisma.class.findMany({
        select: { id: true },
      });
      const classIds = classes.map((cls) => cls.id);

      const regions = await this.prisma.post.findMany({
        where: { type: 'REGION' }, // Assurez-vous que 'REGION' correspond à vos valeurs Enum
        select: { id: true },
      });
      const regionIds = regions.map((region) => region.id);

      const folders: string[] = [];

      // Ajouter les dossiers gallery des units
      unitIds.forEach((id) => {
        folders.push(`units/${id}/gallery/`);
      });

      // Ajouter les dossiers gallery des classes
      classIds.forEach((id) => {
        folders.push(`classes/${id}/gallery/`);
      });

      // Ajouter les dossiers gallery des regions
      regionIds.forEach((id) => {
        folders.push(`regions/${id}/gallery/`);
      });

      const images = await this.listImagesFromFolders(folders);

      if (images.length === 0) {
        throw new InternalServerErrorException('Aucune image de fond trouvée.');
      }

      // Mélanger les images pour une sélection aléatoire
      const shuffledImages = this.shuffleArray(images);

      // Sélectionner les premières 'count' images
      const selectedImages = shuffledImages.slice(0, count);

      // Générer des URLs signées pour chaque image sélectionnée
      const signedUrlsPromises = selectedImages.map(async (imageKey) => {
        const command = new GetObjectCommand({
          Bucket: this.bucketName,
          Key: imageKey,
        });
        const signedUrl = await getSignedUrl(this.s3Client, command, {
          expiresIn: 60 * 60, // 1 heure
        });
        return signedUrl;
      });

      const signedUrls = await Promise.all(signedUrlsPromises);

      return signedUrls;
    } catch (error) {
      this.logger.error(
        'Erreur lors de la récupération des images de fond aléatoires',
        error,
      );
      throw new InternalServerErrorException(
        'Erreur lors de la récupération des images de fond aléatoires',
      );
    }
  }

  // **Helper pour mélanger un tableau**
  private shuffleArray(array: any[]): any[] {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }
}
