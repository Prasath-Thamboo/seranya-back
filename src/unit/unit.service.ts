// spectral5.0/src/unit/unit.service.ts

import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUnitDto, UpdateUnitDto } from './dto/unit.dto';
import { Prisma, UploadType } from '@prisma/client';
import { FileService } from '../files/file.service';
import { URL } from 'url';

@Injectable()
export class UnitService {
  private readonly logger = new Logger(UnitService.name);

  constructor(
    private prisma: PrismaService,
    private fileService: FileService,
  ) {}

  // Méthode pour extraire le Key du fichier depuis l'URL
  private getFileKeyFromUrl(fileUrl: string): string {
    const url = new URL(fileUrl);
    return decodeURIComponent(url.pathname.substring(1)); // Enlever le '/' initial
  }

  async findAll() {
    const units = await this.prisma.unit.findMany({
      include: {
        uploads: true,
        classes: {
          include: {
            uploads: true,
          },
        },
      },
    });

    // Les images sont déjà stockées avec des URLs complètes vers S3
    return units.map((unit) => {
      // Récupérer les images depuis les uploads
      const profileImageUpload = unit.uploads.find(
        (upload) => upload.type === UploadType.PROFILEIMAGE,
      );
      const headerImageUpload = unit.uploads.find(
        (upload) => upload.type === UploadType.HEADERIMAGE,
      );
      const footerImageUpload = unit.uploads.find(
        (upload) => upload.type === UploadType.FOOTERIMAGE,
      );
      const galleryUploads = unit.uploads.filter(
        (upload) => upload.type === UploadType.GALERY,
      );

      // Ajouter les images au modèle de l'unité
      unit['profileImage'] = profileImageUpload?.path || null;
      unit['headerImage'] = headerImageUpload?.path || null;
      unit['footerImage'] = footerImageUpload?.path || null;
      unit['gallery'] = galleryUploads.map((upload) => upload.path);

      return unit;
    });
  }

  async findOne(id: number) {
    const unit = await this.prisma.unit.findUnique({
      where: { id },
      include: {
        uploads: true,
        classes: {
          include: {
            uploads: true,
          },
        },
      },
    });

    if (unit) {
      // Récupérer les images depuis les uploads
      const profileImageUpload = unit.uploads.find(
        (upload) => upload.type === UploadType.PROFILEIMAGE,
      );
      const headerImageUpload = unit.uploads.find(
        (upload) => upload.type === UploadType.HEADERIMAGE,
      );
      const footerImageUpload = unit.uploads.find(
        (upload) => upload.type === UploadType.FOOTERIMAGE,
      );
      const galleryUploads = unit.uploads.filter(
        (upload) => upload.type === UploadType.GALERY,
      );

      // Ajouter les images au modèle de l'unité
      unit['profileImage'] = profileImageUpload?.path || null;
      unit['headerImage'] = headerImageUpload?.path || null;
      unit['footerImage'] = footerImageUpload?.path || null;
      unit['gallery'] = galleryUploads.map((upload) => upload.path);
    }

    return unit;
  }

  async findUnitsByUser(userId: number) {
    return this.prisma.unit.findMany({
      where: {
        users: {
          some: {
            userId,
          },
        },
      },
    });
  }

  async findUnitsByClass(classId: string) {
    return this.prisma.unit.findMany({
      where: {
        classes: {
          some: {
            id: classId,
          },
        },
      },
    });
  }

  // Nouvelle méthode pour récupérer l'utilisateur par ID
  private async getUserById(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    return user;
  }

  // Ajoutez cette méthode dans UnitService

  // Méthode create mise à jour
  // Méthode create corrigée
  async create(
    createUnitDto: CreateUnitDto,
    userId: number,
    profileImage?: Express.Multer.File,
    headerImage?: Express.Multer.File,
    footerImage?: Express.Multer.File,
    galleryImages?: Express.Multer.File[],
  ) {
    try {
      const user = await this.getUserById(userId);

      // Créer l'unité sans les uploads d'images
      const createdUnit = await this.prisma.unit.create({
        data: {
          title: createUnitDto.title,
          intro: createUnitDto.intro,
          type: createUnitDto.type,
          subtitle: createUnitDto.subtitle || null,
          story: createUnitDto.story || null,
          bio: createUnitDto.bio || null,
          quote: createUnitDto.quote || null, // Gestion de la propriété quote
          color: createUnitDto.color || null, // Gestion de la propriété color
          isPublished: createUnitDto.isPublished || false,
          users: {
            create: {
              userId: user.id,
            },
          },
          classes: {
            connect:
              createUnitDto.classIds?.map((classId) => ({ id: classId })) || [],
          },
        },
      });

      // Gestion des images avec S3
      if (profileImage) {
        const profileImageUrl = await this.fileService.uploadImage(
          profileImage,
          `units/${createdUnit.id}/profileImage`,
        );

        await this.createUpload(
          profileImageUrl,
          UploadType.PROFILEIMAGE,
          createdUnit.id,
          user.id,
        );
      }

      if (headerImage) {
        const headerImageUrl = await this.fileService.uploadImage(
          headerImage,
          `units/${createdUnit.id}/headerImage`,
        );

        await this.createUpload(
          headerImageUrl,
          UploadType.HEADERIMAGE,
          createdUnit.id,
          user.id,
        );
      }

      if (footerImage) {
        const footerImageUrl = await this.fileService.uploadImage(
          footerImage,
          `units/${createdUnit.id}/footerImage`,
        );

        await this.createUpload(
          footerImageUrl,
          UploadType.FOOTERIMAGE,
          createdUnit.id,
          user.id,
        );
      }

      if (galleryImages && galleryImages.length > 0) {
        for (const file of galleryImages) {
          const galleryImageUrl = await this.fileService.uploadImage(
            file,
            `units/${createdUnit.id}/gallery`,
          );

          await this.createUpload(
            galleryImageUrl,
            UploadType.GALERY,
            createdUnit.id,
            user.id,
          );
        }
      }

      // Récupérer l'unité avec les uploads pour inclure les URLs des images
      const unitWithUploads = await this.prisma.unit.findUnique({
        where: { id: createdUnit.id },
        include: {
          uploads: true,
          classes: {
            include: {
              uploads: true,
            },
          },
        },
      });

      if (!unitWithUploads) {
        throw new InternalServerErrorException('Unit creation failed');
      }

      // Mapper les images
      const profileImageUpload = unitWithUploads.uploads.find(
        (upload) => upload.type === UploadType.PROFILEIMAGE,
      );
      const headerImageUpload = unitWithUploads.uploads.find(
        (upload) => upload.type === UploadType.HEADERIMAGE,
      );
      const footerImageUpload = unitWithUploads.uploads.find(
        (upload) => upload.type === UploadType.FOOTERIMAGE,
      );
      const galleryUploads = unitWithUploads.uploads.filter(
        (upload) => upload.type === UploadType.GALERY,
      );

      return {
        id: unitWithUploads.id,
        title: unitWithUploads.title,
        intro: unitWithUploads.intro,
        subtitle: unitWithUploads.subtitle,
        story: unitWithUploads.story,
        bio: unitWithUploads.bio,
        quote: unitWithUploads.quote,
        color: unitWithUploads.color,
        isPublished: unitWithUploads.isPublished,
        type: unitWithUploads.type,
        createdAt: unitWithUploads.createdAt,
        updatedAt: unitWithUploads.updatedAt,
        profileImage: profileImageUpload?.path || null,
        headerImage: headerImageUpload?.path || null,
        footerImage: footerImageUpload?.path || null,
        gallery: galleryUploads.map((upload) => upload.path),
        classes: unitWithUploads.classes,
      };
    } catch (error) {
      this.handleException(error);
    }
  }

  private async createUpload(
    fileUrl: string,
    type: UploadType,
    unitId: number,
    userId: number,
  ) {
    return this.prisma.upload.create({
      data: {
        path: fileUrl,
        type,
        units: {
          connect: { id: unitId },
        },
        users: {
          connect: { id: userId },
        },
      },
    });
  }

  private async replaceExistingImage(unitId: number, type: UploadType) {
    const existingUpload = await this.prisma.upload.findFirst({
      where: {
        units: {
          some: { id: unitId },
        },
        type,
      },
    });

    if (existingUpload) {
      try {
        await this.deleteGalleryImage(existingUpload.id);
      } catch (error) {
        this.logger.warn(`Aucune image à supprimer pour le type ${type}.`);
      }
    }
  }

  public async deleteGalleryImage(uploadId: number) {
    this.logger.log(
      `Tentative de suppression de l'upload avec l'ID : ${uploadId}`,
    );

    try {
      const upload = await this.prisma.upload.findUnique({
        where: { id: uploadId },
      });

      if (!upload) {
        this.logger.warn(`Upload non trouvé pour l'ID : ${uploadId}`);
        return;
      }

      this.logger.log(
        `Upload trouvé : ${upload.id}, chemin du fichier : ${upload.path}`,
      );

      try {
        const fileKey = this.getFileKeyFromUrl(upload.path);
        await this.fileService.deleteImage(fileKey);
        this.logger.log(`Fichier supprimé avec succès : ${upload.path}`);
      } catch (fileError) {
        this.logger.warn(
          `Erreur lors de la suppression du fichier : ${upload.path}. Fichier non trouvé ou déjà supprimé.`,
        );
      }

      try {
        const deletedUpload = await this.prisma.upload.delete({
          where: { id: uploadId },
        });
        this.logger.log(`Upload supprimé avec succès : ${deletedUpload.id}`);
        return deletedUpload;
      } catch (dbError) {
        this.logger.error(
          `Erreur lors de la suppression de l'objet Upload avec l'ID : ${uploadId}`,
          dbError,
        );
        throw new InternalServerErrorException(
          `Erreur lors de la suppression de l'objet Upload avec l'ID : ${uploadId}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Erreur lors de la tentative de suppression de l'upload avec l'ID : ${uploadId}`,
        error,
      );
      throw error;
    }
  }

  async update(
    id: number,
    updateUnitDto: UpdateUnitDto,
    userId: number,
    profileImage?: Express.Multer.File,
    galleryImages?: Express.Multer.File[],
    headerImage?: Express.Multer.File,
    footerImage?: Express.Multer.File,
    galleryImagesToDelete?: string[],
  ) {
    try {
      const user = await this.getUserById(userId);

      const existingUnit = await this.prisma.unit.findUnique({ where: { id } });
      if (!existingUnit) {
        throw new BadRequestException('Unit not found');
      }

      // Supprimer les images de la galerie si nécessaire
      if (galleryImagesToDelete && galleryImagesToDelete.length > 0) {
        for (const uploadId of galleryImagesToDelete) {
          await this.deleteGalleryImage(parseInt(uploadId));
        }
      }

      // Mettre à jour l'unité
      const updatedUnit = await this.prisma.unit.update({
        where: { id },
        data: {
          ...(updateUnitDto.title && { title: updateUnitDto.title }),
          ...(updateUnitDto.intro && { intro: updateUnitDto.intro }),
          ...(updateUnitDto.subtitle && { subtitle: updateUnitDto.subtitle }),
          ...(updateUnitDto.story && { story: updateUnitDto.story }),
          ...(updateUnitDto.bio && { bio: updateUnitDto.bio }),
          ...(updateUnitDto.quote !== undefined && {
            quote: updateUnitDto.quote,
          }),
          ...(updateUnitDto.color !== undefined && {
            color: updateUnitDto.color,
          }),
          ...(updateUnitDto.isPublished !== undefined && {
            isPublished: updateUnitDto.isPublished,
          }),
          ...(updateUnitDto.type && { type: updateUnitDto.type }),
          users: {
            update: {
              where: { userId_unitId: { userId: user.id, unitId: id } },
              data: {
                userId: user.id,
              },
            },
          },
          classes: {
            set: [],
            connect:
              updateUnitDto.classIds?.map((classId) => ({ id: classId })) || [],
          },
        },
      });

      // Gestion des images avec S3
      if (profileImage) {
        await this.replaceExistingImage(id, UploadType.PROFILEIMAGE);
        const profileImageUrl = await this.fileService.uploadImage(
          profileImage,
          `units/${id}/profileImage`,
        );

        await this.createUpload(
          profileImageUrl,
          UploadType.PROFILEIMAGE,
          id,
          user.id,
        );
      }

      if (headerImage) {
        await this.replaceExistingImage(id, UploadType.HEADERIMAGE);
        const headerImageUrl = await this.fileService.uploadImage(
          headerImage,
          `units/${id}/headerImage`,
        );

        await this.createUpload(
          headerImageUrl,
          UploadType.HEADERIMAGE,
          id,
          user.id,
        );
      }

      if (footerImage) {
        await this.replaceExistingImage(id, UploadType.FOOTERIMAGE);
        const footerImageUrl = await this.fileService.uploadImage(
          footerImage,
          `units/${id}/footerImage`,
        );

        await this.createUpload(
          footerImageUrl,
          UploadType.FOOTERIMAGE,
          id,
          user.id,
        );
      }

      if (galleryImages) {
        for (const file of galleryImages) {
          const galleryImageUrl = await this.fileService.uploadImage(
            file,
            `units/${id}/gallery`,
          );

          await this.createUpload(
            galleryImageUrl,
            UploadType.GALERY,
            id,
            user.id,
          );
        }
      }

      return updatedUnit;
    } catch (error) {
      this.handleException(error);
    }
  }

  async remove(id: number) {
    try {
      const unit = await this.prisma.unit.findUnique({ where: { id } });
      if (unit) {
        await this.prisma.userUnit.deleteMany({
          where: { unitId: id },
        });

        const uploads = await this.prisma.upload.findMany({
          where: { units: { some: { id: unit.id } } },
        });

        for (const upload of uploads) {
          const fileKey = this.getFileKeyFromUrl(upload.path);
          await this.fileService.deleteImage(fileKey);
          await this.prisma.upload.delete({ where: { id: upload.id } });
        }
      }

      // Supprimer l'unité
      return await this.prisma.unit.delete({ where: { id } });
    } catch (error) {
      this.handleException(error);
    }
  }

  private handleException(error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new BadRequestException({
        message: 'Prisma error during Unit operation',
        error: error.message,
        details: error.meta?.target || 'Unknown field error',
      });
    } else {
      this.logger.error('Unexpected error during Unit operation', error.stack);
      throw new InternalServerErrorException({
        message: 'Internal server error during Unit operation',
        error: error.message,
      });
    }
  }

  // Nouvelle méthode pour récupérer tous les IDs des units
  async getAllUnitIds(): Promise<number[]> {
    try {
      const units = await this.prisma.unit.findMany({
        select: { id: true },
      });
      return units.map((unit) => unit.id);
    } catch (error) {
      this.logger.error(
        'Erreur lors de la récupération des IDs des units',
        error,
      );
      throw new InternalServerErrorException(
        'Erreur lors de la récupération des IDs des units',
      );
    }
  }
}
