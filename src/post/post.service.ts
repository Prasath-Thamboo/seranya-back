// spectral5.0/src/post/post.service.ts

import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto, UpdatePostDto } from './dto/post.dto';
import { Prisma, UploadType, PostType } from '@prisma/client';
import { FileService } from '../files/file.service';
import { URL } from 'url';

@Injectable()
export class PostService {
  private readonly logger = new Logger(PostService.name);

  constructor(
    private prisma: PrismaService,
    private fileService: FileService,
  ) {}

  // Méthode pour extraire le Key du fichier depuis l'URL
  private getFileKeyFromUrl(fileUrl: string): string {
    const url = new URL(fileUrl);
    return decodeURIComponent(url.pathname.substring(1)); // Enlever le '/' initial
  }

  // Méthode findAll
  async findAll() {
    const posts = await this.prisma.post.findMany({
      include: {
        uploads: true,
        postUnits: {
          include: {
            unit: {
              include: {
                uploads: true,
              },
            },
          },
        },
        postClasses: {
          include: {
            class: {
              include: {
                uploads: true,
              },
            },
          },
        },
      },
    });

    return posts.map((post) => {
      // Gestion des images
      const profileImageUpload = post.uploads.find(
        (upload) => upload.type === UploadType.PROFILEIMAGE,
      );
      const headerImageUpload = post.uploads.find(
        (upload) => upload.type === UploadType.HEADERIMAGE,
      );
      const footerImageUpload = post.uploads.find(
        (upload) => upload.type === UploadType.FOOTERIMAGE,
      );
      const galleryUploads = post.uploads.filter(
        (upload) => upload.type === UploadType.GALERY,
      );

      // Ajouter les images au modèle du post
      post['profileImage'] = profileImageUpload?.path || null;
      post['headerImage'] = headerImageUpload?.path || null;
      post['footerImage'] = footerImageUpload?.path || null;
      post['gallery'] = galleryUploads.map((upload) => upload.path);

      return post;
    });
  }

  // Nouvelle Méthode : findAllRegions
  async findAllRegions() {
    try {
      const regionPosts = await this.prisma.post.findMany({
        where: {
          type: PostType.REGION,
        },
        include: {
          uploads: true,
          postUnits: {
            include: {
              unit: {
                include: {
                  uploads: true,
                },
              },
            },
          },
          postClasses: {
            include: {
              class: {
                include: {
                  uploads: true,
                },
              },
            },
          },
        },
      });

      return regionPosts.map((post) => {
        // Gestion des images
        const profileImageUpload = post.uploads.find(
          (upload) => upload.type === UploadType.PROFILEIMAGE,
        );
        const headerImageUpload = post.uploads.find(
          (upload) => upload.type === UploadType.HEADERIMAGE,
        );
        const footerImageUpload = post.uploads.find(
          (upload) => upload.type === UploadType.FOOTERIMAGE,
        );
        const galleryUploads = post.uploads.filter(
          (upload) => upload.type === UploadType.GALERY,
        );

        // Ajouter les images au modèle du post
        post['profileImage'] = profileImageUpload?.path || null;
        post['headerImage'] = headerImageUpload?.path || null;
        post['footerImage'] = footerImageUpload?.path || null;
        post['gallery'] = galleryUploads.map((upload) => upload.path);

        return post;
      });
    } catch (error) {
      this.handleException(error);
    }
  }

  // Méthode findOne
  async findOne(id: number) {
    const foundPost = await this.prisma.post.findUnique({
      where: { id },
      include: {
        uploads: true,
        postUnits: {
          include: {
            unit: {
              include: {
                uploads: true,
              },
            },
          },
        },
        postClasses: {
          include: {
            class: {
              include: {
                uploads: true,
              },
            },
          },
        },
      },
    });

    if (!foundPost) {
      throw new BadRequestException('Post not found');
    }

    // Gestion des images
    const profileImageUpload = foundPost.uploads.find(
      (upload) => upload.type === UploadType.PROFILEIMAGE,
    );
    const headerImageUpload = foundPost.uploads.find(
      (upload) => upload.type === UploadType.HEADERIMAGE,
    );
    const footerImageUpload = foundPost.uploads.find(
      (upload) => upload.type === UploadType.FOOTERIMAGE,
    );
    const galleryUploads = foundPost.uploads.filter(
      (upload) => upload.type === UploadType.GALERY,
    );

    // Ajouter les images au modèle du post
    foundPost['profileImage'] = profileImageUpload?.path || null;
    foundPost['headerImage'] = headerImageUpload?.path || null;
    foundPost['footerImage'] = footerImageUpload?.path || null;
    foundPost['gallery'] = galleryUploads.map((upload) => upload.path);

    return foundPost;
  }

  async create(
    createPostDto: CreatePostDto,
    profileImage?: Express.Multer.File,
    headerImage?: Express.Multer.File,
    footerImage?: Express.Multer.File,
    galleryImages?: Express.Multer.File[],
  ) {
    try {
      const createdPost = await this.prisma.post.create({
        data: {
          title: createPostDto.title,
          intro: createPostDto.intro,
          subtitle: createPostDto.subtitle || null,
          content: createPostDto.content || null,
          color: createPostDto.color || null, // Gestion de la propriété color
          isPublished: createPostDto.isPublished || false,
          type: createPostDto.type as PostType, // Assurez-vous que le type est correct
          postUnits: {
            create:
              createPostDto.unitIds?.map((unitId) => ({
                unit: { connect: { id: Number(unitId) } }, // Conversion en nombre
              })) || [],
          },
          postClasses: {
            create:
              createPostDto.classIds?.map((classId) => ({
                class: { connect: { id: classId } },
              })) || [],
          },
        },
      });

      // Gestion des images avec S3
      if (profileImage) {
        const profileImageUrl = await this.fileService.uploadImage(
          profileImage,
          `posts/${createdPost.id}/profileImage`,
        );

        await this.createUpload(
          profileImageUrl,
          UploadType.PROFILEIMAGE,
          createdPost.id,
        );
      }

      if (headerImage) {
        const headerImageUrl = await this.fileService.uploadImage(
          headerImage,
          `posts/${createdPost.id}/headerImage`,
        );

        await this.createUpload(
          headerImageUrl,
          UploadType.HEADERIMAGE,
          createdPost.id,
        );
      }

      if (footerImage) {
        const footerImageUrl = await this.fileService.uploadImage(
          footerImage,
          `posts/${createdPost.id}/footerImage`,
        );

        await this.createUpload(
          footerImageUrl,
          UploadType.FOOTERIMAGE,
          createdPost.id,
        );
      }

      if (galleryImages) {
        for (const file of galleryImages) {
          const galleryImageUrl = await this.fileService.uploadImage(
            file,
            `posts/${createdPost.id}/gallery`,
          );

          await this.createUpload(
            galleryImageUrl,
            UploadType.GALERY,
            createdPost.id,
          );
        }
      }

      return createdPost;
    } catch (error) {
      this.handleException(error);
    }
  }

  async update(
    id: number,
    updatePostDto: UpdatePostDto,
    profileImage?: Express.Multer.File,
    headerImage?: Express.Multer.File,
    footerImage?: Express.Multer.File,
    galleryImages?: Express.Multer.File[],
    galleryImagesToDelete?: string[],
  ) {
    try {
      const existingPost = await this.prisma.post.findUnique({
        where: { id },
        include: { uploads: true },
      });

      if (!existingPost) {
        throw new BadRequestException('Post not found');
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
          `posts/${id}/profileImage`,
        );

        await this.createUpload(profileImageUrl, UploadType.PROFILEIMAGE, id);
      }

      if (headerImage) {
        await this.replaceExistingImage(id, UploadType.HEADERIMAGE);
        const headerImageUrl = await this.fileService.uploadImage(
          headerImage,
          `posts/${id}/headerImage`,
        );

        await this.createUpload(headerImageUrl, UploadType.HEADERIMAGE, id);
      }

      if (footerImage) {
        await this.replaceExistingImage(id, UploadType.FOOTERIMAGE);
        const footerImageUrl = await this.fileService.uploadImage(
          footerImage,
          `posts/${id}/footerImage`,
        );

        await this.createUpload(footerImageUrl, UploadType.FOOTERIMAGE, id);
      }

      if (galleryImages) {
        for (const file of galleryImages) {
          const galleryImageUrl = await this.fileService.uploadImage(
            file,
            `posts/${id}/gallery`,
          );

          await this.createUpload(galleryImageUrl, UploadType.GALERY, id);
        }
      }

      // Mettre à jour le post et reconnecter les unités et classes
      return this.prisma.post.update({
        where: { id },
        data: {
          ...(updatePostDto.title && { title: updatePostDto.title }),
          ...(updatePostDto.intro && { intro: updatePostDto.intro }),
          ...(updatePostDto.subtitle && { subtitle: updatePostDto.subtitle }),
          ...(updatePostDto.content && { content: updatePostDto.content }),
          ...(updatePostDto.color !== undefined && {
            color: updatePostDto.color,
          }), // Gestion de la propriété color
          ...(updatePostDto.isPublished !== undefined && {
            isPublished: updatePostDto.isPublished,
          }),
          ...(updatePostDto.type && { type: updatePostDto.type }),
          postUnits: {
            deleteMany: {},
            create:
              updatePostDto.unitIds?.map((unitId) => ({
                unit: { connect: { id: Number(unitId) } }, // Conversion en nombre
              })) || [],
          },
          postClasses: {
            deleteMany: {},
            create:
              updatePostDto.classIds?.map((classId) => ({
                class: { connect: { id: classId } },
              })) || [],
          },
        },
      });
    } catch (error) {
      this.handleException(error);
    }
  }

  async remove(id: number) {
    try {
      const foundPost = await this.prisma.post.findUnique({
        where: { id },
        include: { uploads: true, postUnits: true, postClasses: true },
      });

      if (!foundPost) {
        throw new BadRequestException('Post not found');
      }

      // Supprimer les uploads associés de S3
      for (const upload of foundPost.uploads) {
        const fileKey = this.getFileKeyFromUrl(upload.path);
        await this.fileService.deleteImage(fileKey);
        await this.prisma.upload.delete({ where: { id: upload.id } });
      }

      // Supprimer les relations avec les unités et classes
      await this.prisma.postUnit.deleteMany({ where: { postId: id } });
      await this.prisma.postClass.deleteMany({ where: { postId: id } });

      // Supprimer le post
      await this.prisma.post.delete({ where: { id } });

      this.logger.log(`Post with ID ${id} successfully deleted`);
    } catch (error) {
      this.handleException(error);
    }
  }

  // Méthode pour créer un upload
  private async createUpload(
    fileUrl: string,
    type: UploadType,
    postId: number,
  ) {
    return this.prisma.upload.create({
      data: {
        path: fileUrl,
        type,
        posts: {
          connect: { id: postId },
        },
      },
    });
  }

  // Méthode pour remplacer une image existante
  private async replaceExistingImage(postId: number, type: UploadType) {
    const existingUpload = await this.prisma.upload.findFirst({
      where: {
        posts: {
          some: { id: postId },
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

      this.logger.log(`Upload found: ${upload.id}, file URL: ${upload.path}`);

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

  // Méthode pour gérer les exceptions
  private handleException(error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new BadRequestException({
        message: 'Prisma error during Post operation',
        error: error.message,
        details: error.meta?.target || 'Unknown field error',
      });
    } else {
      this.logger.error('Unexpected error during Post operation', error.stack);
      throw new InternalServerErrorException({
        message: 'Internal server error during Post operation',
        error: error.message,
      });
    }
  }

  // Nouvelle méthode pour récupérer tous les IDs des posts de type REGION
  async getAllRegionIds(): Promise<number[]> {
    try {
      const regions = await this.prisma.post.findMany({
        where: { type: 'REGION' }, // Assurez-vous que 'REGION' correspond à vos valeurs Enum
        select: { id: true },
      });
      return regions.map((region) => region.id);
    } catch (error) {
      this.logger.error(
        'Erreur lors de la récupération des IDs des regions',
        error,
      );
      throw new InternalServerErrorException(
        'Erreur lors de la récupération des IDs des regions',
      );
    }
  }
}
