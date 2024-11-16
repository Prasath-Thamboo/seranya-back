// spectral5.0/src/class/class.service.ts

import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClassDto, UpdateClassDto } from './dto/class.dto';
import { Prisma, UploadType } from '@prisma/client';
import { FileService } from '../files/file.service';

@Injectable()
export class ClassService {
  private readonly logger = new Logger(ClassService.name);

  constructor(
    private prisma: PrismaService,
    private fileService: FileService,
  ) {
    this.logger.log(`NODE_ENV is: ${process.env.NODE_ENV}`);
  }

  async findAll() {
    const classes = await this.prisma.class.findMany({
      include: {
        uploads: true,
        units: {
          include: {
            uploads: true,
          },
        },
      },
    });

    return classes.map((cls) => {
      cls.uploads = cls.uploads.map((upload) => {
        // Assurez-vous que upload.path est une URL S3 complète
        if (upload.path) {
          return {
            ...upload,
            path: upload.path, // S3 URL déjà complète
          };
        } else {
          this.logger.warn(
            `upload.path est undefined pour l'upload ID: ${upload.id}`,
          );
          return upload;
        }
      });

      cls.units = cls.units.map((unit) => {
        unit.uploads = unit.uploads.map((upload) => {
          if (upload.path) {
            return {
              ...upload,
              path: upload.path, // S3 URL déjà complète
            };
          } else {
            this.logger.warn(
              `upload.path est undefined pour l'upload ID: ${upload.id}`,
            );
            return upload;
          }
        });
        return unit;
      });

      // Ajuster les images de galerie si nécessaire
      const galleryImages = cls.uploads
        .filter((upload) => upload.type === UploadType.GALERY)
        .map((upload) => upload.path);

      cls['gallery'] = galleryImages;
      cls['galleryUploadIds'] = cls.uploads
        .filter((upload) => upload.type === UploadType.GALERY)
        .map((upload) => upload.id);

      return cls;
    });
  }

  async findOne(id: string) {
    const foundClass = await this.prisma.class.findUnique({
      where: { id },
      include: {
        uploads: true,
        units: {
          include: {
            uploads: true,
          },
        },
      },
    });

    if (!foundClass) {
      throw new BadRequestException('Class not found');
    }

    foundClass.uploads = foundClass.uploads.map((upload) => {
      if (upload.path) {
        return {
          ...upload,
          path: upload.path, // S3 URL déjà complète
        };
      } else {
        this.logger.warn(
          `upload.path est undefined pour l'upload ID: ${upload.id}`,
        );
        return upload;
      }
    });

    foundClass.units = foundClass.units.map((unit) => {
      unit.uploads = unit.uploads.map((upload) => {
        if (upload.path) {
          return {
            ...upload,
            path: upload.path, // S3 URL déjà complète
          };
        } else {
          this.logger.warn(
            `upload.path est undefined pour l'upload ID: ${upload.id}`,
          );
          return upload;
        }
      });
      return unit;
    });

    // Ajuster les images de galerie
    const galleryImages = foundClass.uploads
      .filter((upload) => upload.type === UploadType.GALERY)
      .map((upload) => upload.path);

    const galleryUploadIds = foundClass.uploads
      .filter((upload) => upload.type === UploadType.GALERY)
      .map((upload) => upload.id);

    foundClass['gallery'] = galleryImages;
    foundClass['galleryUploadIds'] = galleryUploadIds;

    return foundClass;
  }

  // Méthode pour créer une nouvelle classe avec la gestion des images
  async create(
    createClassDto: CreateClassDto,
    profileImage?: Express.Multer.File,
    headerImage?: Express.Multer.File,
    footerImage?: Express.Multer.File,
    galleryImages?: Express.Multer.File[],
  ) {
    try {
      const createdClass = await this.prisma.class.create({
        data: {
          title: createClassDto.title,
          intro: createClassDto.intro,
          subtitle: createClassDto.subtitle || null,
          story: createClassDto.story || null,
          bio: createClassDto.bio || null,
          quote: createClassDto.quote || null, // Gestion de la propriété quote
          color: createClassDto.color || null, // Gestion de la propriété color
          isPublished: createClassDto.isPublished || false,
          units: {
            connect:
              createClassDto.unitIds?.map((unitId) => ({ id: unitId })) || [],
          },
        },
      });

      // Gestion des images avec S3 via FileService
      if (profileImage) {
        await this.replaceExistingImage(
          createdClass.id,
          UploadType.PROFILEIMAGE,
        );
        const profileImageUrl = await this.fileService.uploadImage(
          profileImage,
          `classes/${createdClass.id}/profileImage`,
        );

        await this.createUpload(
          profileImageUrl,
          UploadType.PROFILEIMAGE,
          createdClass.id,
        );
      }

      if (headerImage) {
        await this.replaceExistingImage(
          createdClass.id,
          UploadType.HEADERIMAGE,
        );
        const headerImageUrl = await this.fileService.uploadImage(
          headerImage,
          `classes/${createdClass.id}/headerImage`,
        );

        await this.createUpload(
          headerImageUrl,
          UploadType.HEADERIMAGE,
          createdClass.id,
        );
      }

      if (footerImage) {
        await this.replaceExistingImage(
          createdClass.id,
          UploadType.FOOTERIMAGE,
        );
        const footerImageUrl = await this.fileService.uploadImage(
          footerImage,
          `classes/${createdClass.id}/footerImage`,
        );

        await this.createUpload(
          footerImageUrl,
          UploadType.FOOTERIMAGE,
          createdClass.id,
        );
      }

      if (galleryImages) {
        for (const file of galleryImages) {
          const galleryImageUrl = await this.fileService.uploadImage(
            file,
            `classes/${createdClass.id}/gallery`,
          );

          await this.createUpload(
            galleryImageUrl,
            UploadType.GALERY,
            createdClass.id,
          );
        }
      }

      return createdClass;
    } catch (error) {
      this.handleException(error);
    }
  }

  // Méthode pour mettre à jour une classe existante avec la gestion des images
  async update(
    id: string,
    updateClassDto: UpdateClassDto,
    profileImage?: Express.Multer.File,
    headerImage?: Express.Multer.File,
    footerImage?: Express.Multer.File,
    galleryImages?: Express.Multer.File[],
    galleryImagesToDelete?: string[],
  ) {
    try {
      const existingClass = await this.prisma.class.findUnique({
        where: { id },
      });
      if (!existingClass) {
        throw new BadRequestException('Class not found');
      }

      // Supprimer les images de la galerie si nécessaire
      if (galleryImagesToDelete && galleryImagesToDelete.length > 0) {
        for (const uploadId of galleryImagesToDelete) {
          await this.deleteGalleryImage(parseInt(uploadId));
        }
      }

      // Gérer le remplacement des images existantes
      if (profileImage) {
        await this.replaceExistingImage(id, UploadType.PROFILEIMAGE);
        const profileImageUrl = await this.fileService.uploadImage(
          profileImage,
          `classes/${id}/profileImage`,
        );

        await this.createUpload(profileImageUrl, UploadType.PROFILEIMAGE, id);
      }

      if (headerImage) {
        await this.replaceExistingImage(id, UploadType.HEADERIMAGE);
        const headerImageUrl = await this.fileService.uploadImage(
          headerImage,
          `classes/${id}/headerImage`,
        );

        await this.createUpload(headerImageUrl, UploadType.HEADERIMAGE, id);
      }

      if (footerImage) {
        await this.replaceExistingImage(id, UploadType.FOOTERIMAGE);
        const footerImageUrl = await this.fileService.uploadImage(
          footerImage,
          `classes/${id}/footerImage`,
        );

        await this.createUpload(footerImageUrl, UploadType.FOOTERIMAGE, id);
      }

      if (galleryImages) {
        for (const file of galleryImages) {
          const galleryImageUrl = await this.fileService.uploadImage(
            file,
            `classes/${id}/gallery`,
          );

          await this.createUpload(galleryImageUrl, UploadType.GALERY, id);
        }
      }

      // Mettre à jour la classe et reconnecter les unités
      return this.prisma.class.update({
        where: { id },
        data: {
          ...(updateClassDto.title && { title: updateClassDto.title }),
          ...(updateClassDto.intro && { intro: updateClassDto.intro }),
          ...(updateClassDto.subtitle && { subtitle: updateClassDto.subtitle }),
          ...(updateClassDto.story && { story: updateClassDto.story }),
          ...(updateClassDto.bio && { bio: updateClassDto.bio }),
          ...(updateClassDto.quote !== undefined && {
            quote: updateClassDto.quote,
          }), // Gestion de la propriété quote
          ...(updateClassDto.color !== undefined && {
            color: updateClassDto.color,
          }), // Gestion de la propriété color
          ...(updateClassDto.isPublished !== undefined && {
            isPublished: updateClassDto.isPublished,
          }),
          units: {
            set: [],
            connect:
              updateClassDto.unitIds?.map((unitId) => ({
                id: Number(unitId),
              })) || [],
          },
        },
      });
    } catch (error) {
      this.handleException(error);
    }
  }

  // Méthode pour supprimer une classe et ses entités associées
  async remove(id: string) {
    try {
      const foundClass = await this.prisma.class.findUnique({
        where: { id },
        include: { uploads: true, units: true },
      });

      if (!foundClass) {
        throw new BadRequestException('Class not found');
      }

      // Supprimer les uploads associés de S3
      for (const upload of foundClass.uploads) {
        // Extraire le Key S3 à partir de l'URL
        const fileKey = this.getFileKeyFromUrl(upload.path);
        await this.fileService.deleteImage(fileKey);
        await this.prisma.upload.delete({ where: { id: upload.id } });
      }

      // Déconnecter les unités associées
      await this.prisma.class.update({
        where: { id },
        data: { units: { set: [] } },
      });

      // Supprimer la classe
      await this.prisma.class.delete({ where: { id } });

      this.logger.log(`Class with ID ${id} successfully deleted`);
    } catch (error) {
      this.handleException(error);
    }
  }

  // Méthode pour créer un upload dans la base de données
  private async createUpload(
    fileUrl: string, // URL complète de S3
    type: UploadType,
    classId: string,
  ) {
    return this.prisma.upload.create({
      data: {
        path: fileUrl, // Stocker l'URL complète de S3
        type,
        classes: {
          connect: { id: classId },
        },
      },
    });
  }

  // Méthode pour remplacer une image existante
  private async replaceExistingImage(classId: string, type: UploadType) {
    const existingUpload = await this.prisma.upload.findFirst({
      where: {
        classes: {
          some: { id: classId },
        },
        type,
      },
    });

    if (existingUpload) {
      try {
        await this.deleteGalleryImage(existingUpload.id);
      } catch (error) {
        this.logger.warn(`No image to delete for type ${type}.`);
      }
    }
  }

  // Méthode pour supprimer une image de la galerie
  private async deleteGalleryImage(uploadId: number) {
    this.logger.log(`Attempting to delete upload with ID: ${uploadId}`);

    try {
      const upload = await this.prisma.upload.findUnique({
        where: { id: uploadId },
      });

      if (!upload) {
        this.logger.warn(`Upload not found for ID: ${uploadId}`);
        return;
      }

      this.logger.log(`Upload found: ${upload.id}, file path: ${upload.path}`);

      try {
        const fileKey = this.getFileKeyFromUrl(upload.path);
        await this.fileService.deleteImage(fileKey);
        this.logger.log(`File successfully deleted: ${upload.path}`);
      } catch (fileError) {
        this.logger.warn(
          `Error deleting file: ${upload.path}. File not found or already deleted.`,
        );
      }

      try {
        const deletedUpload = await this.prisma.upload.delete({
          where: { id: uploadId },
        });
        this.logger.log(`Upload successfully deleted: ${deletedUpload.id}`);
        return deletedUpload;
      } catch (dbError) {
        this.logger.error(
          `Error deleting Upload object with ID: ${uploadId}`,
          dbError,
        );
        throw new InternalServerErrorException(
          `Error deleting Upload object with ID: ${uploadId}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Error attempting to delete upload with ID: ${uploadId}`,
        error,
      );
      throw error;
    }
  }

  // Méthode pour extraire le Key S3 à partir de l'URL
  private getFileKeyFromUrl(fileUrl: string): string {
    try {
      const url = new URL(fileUrl);
      return decodeURIComponent(url.pathname.substring(1)); // Enlever le '/' initial
    } catch (error) {
      this.logger.error(`Invalid URL for S3 file: ${fileUrl}`, error);
      throw new InternalServerErrorException('Invalid file URL');
    }
  }

  // Méthode pour gérer les exceptions
  private handleException(error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new BadRequestException({
        message: 'Prisma error during Class operation',
        error: error.message,
        details: error.meta?.target || 'Unknown field error',
      });
    } else {
      this.logger.error('Unexpected error during Class operation', error.stack);
      throw new InternalServerErrorException({
        message: 'Internal server error during Class operation',
        error: error.message,
      });
    }
  }

  // Nouvelle méthode pour récupérer tous les IDs des classes
  async getAllClassIds(): Promise<string[]> {
    try {
      const classes = await this.prisma.class.findMany({
        select: { id: true },
      });
      return classes.map((cls) => cls.id);
    } catch (error) {
      this.logger.error(
        'Erreur lors de la récupération des IDs des classes',
        error,
      );
      throw new InternalServerErrorException(
        'Erreur lors de la récupération des IDs des classes',
      );
    }
  }
}
