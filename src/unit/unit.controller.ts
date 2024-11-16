// spectral5.0/src/unit/unit.controller.ts

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  UseGuards,
  HttpException,
  Req,
  Logger,
} from '@nestjs/common';
import { UnitService } from './unit.service';
import { CreateUnitDto, UpdateUnitDto } from './dto/unit.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { RoleGuard } from '../auth/role.guard';
import { Roles } from '../auth/roles.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Request } from 'express';
import { User } from '@prisma/client';
import * as multer from 'multer'; // Import de multer

@Controller('units')
@ApiBearerAuth()
export class UnitController {
  private readonly logger = new Logger(UnitController.name);

  constructor(private readonly unitService: UnitService) {}

  @Get()
  findAll() {
    return this.unitService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.unitService.findOne(+id);
  }

  @Get('user/:userId')
  findUnitsByUser(@Param('userId') userId: string) {
    return this.unitService.findUnitsByUser(+userId);
  }

  @Get('class/:classId')
  findUnitsByClass(@Param('classId') classId: string) {
    return this.unitService.findUnitsByClass(classId); // classId est déjà une chaîne de caractères
  }

  @Post()
  @Roles('ADMIN', 'EDITOR')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'profileImage', maxCount: 1 },
        { name: 'headerImage', maxCount: 1 },
        { name: 'footerImage', maxCount: 1 },
        { name: 'gallery', maxCount: 30 },
      ],
      {
        storage: multer.memoryStorage(), // Configuration pour stocker en mémoire
      },
    ),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description:
      "Les données de création d'unité avec téléchargement de fichiers",
    type: CreateUnitDto,
  })
  async create(
    @Req() req: Request & { user: User },
    @UploadedFiles()
    files: {
      profileImage?: Express.Multer.File[];
      headerImage?: Express.Multer.File[];
      footerImage?: Express.Multer.File[];
      gallery?: Express.Multer.File[];
    },
    @Body() createUnitDto: CreateUnitDto,
  ) {
    this.logger.log('Received body:', JSON.stringify(createUnitDto));
    this.logger.log(
      'Received files:',
      JSON.stringify({
        profileImage: files.profileImage
          ? files.profileImage[0].originalname
          : 'None',
        headerImage: files.headerImage
          ? files.headerImage[0].originalname
          : 'None',
        footerImage: files.footerImage
          ? files.footerImage[0].originalname
          : 'None',
        gallery: files.gallery ? `${files.gallery.length} file(s)` : 'None',
      }),
    );

    // Logs détaillés pour les fichiers
    if (files.profileImage) {
      this.logger.log(
        `Profile Image received: ${files.profileImage[0].originalname}, Size: ${files.profileImage[0].size}`,
      );
    }
    if (files.headerImage) {
      this.logger.log(
        `Header Image received: ${files.headerImage[0].originalname}, Size: ${files.headerImage[0].size}`,
      );
    }
    if (files.footerImage) {
      this.logger.log(
        `Footer Image received: ${files.footerImage[0].originalname}, Size: ${files.footerImage[0].size}`,
      );
    }
    if (files.gallery && files.gallery.length > 0) {
      this.logger.log(`Gallery Images received: ${files.gallery.length}`);
    }

    try {
      if (!req.user || !req.user.id) {
        throw new HttpException('User not authenticated', 401);
      }

      const profileImage = files.profileImage
        ? files.profileImage[0]
        : undefined;
      const headerImage = files.headerImage ? files.headerImage[0] : undefined;
      const footerImage = files.footerImage ? files.footerImage[0] : undefined;
      const galleryImages = files.gallery || [];

      const createdUnit = await this.unitService.create(
        createUnitDto,
        req.user.id,
        profileImage,
        headerImage,
        footerImage,
        galleryImages,
      );

      this.logger.log(`Unit created successfully with ID: ${createdUnit.id}`);

      return createdUnit;
    } catch (error) {
      this.logger.error('Error during unit creation:', error);

      let statusCode = 500;
      let message = 'Internal Server Error';

      if (error.code === 'P2002') {
        statusCode = 400;
        message = 'Unit already exists';
      } else if (error.code === 'P2025') {
        statusCode = 404;
        message = 'Resource not found';
      }

      throw new HttpException({ message, details: error.message }, statusCode);
    }
  }

  @Patch(':id')
  @Roles('ADMIN', 'EDITOR')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'profileImage', maxCount: 1 },
        { name: 'headerImage', maxCount: 1 },
        { name: 'footerImage', maxCount: 1 },
        { name: 'gallery', maxCount: 30 },
      ],
      {
        storage: multer.memoryStorage(), // Configuration pour stocker en mémoire
      },
    ),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description:
      "Les données de mise à jour d'unité avec téléchargement de fichiers",
    type: UpdateUnitDto,
  })
  async update(
    @Param('id') id: string,
    @Req() req: Request & { user: User },
    @Body() updateUnitDto: UpdateUnitDto,
    @UploadedFiles()
    files: {
      profileImage?: Express.Multer.File[];
      headerImage?: Express.Multer.File[];
      footerImage?: Express.Multer.File[];
      gallery?: Express.Multer.File[];
    },
  ) {
    this.logger.log('Received body for update:', updateUnitDto);
    this.logger.log('Received files for update:', {
      profileImage: files.profileImage
        ? files.profileImage[0].originalname
        : 'None',
      headerImage: files.headerImage
        ? files.headerImage[0].originalname
        : 'None',
      footerImage: files.footerImage
        ? files.footerImage[0].originalname
        : 'None',
      gallery: files.gallery ? `${files.gallery.length} file(s)` : 'None',
    });

    const profileImage = files.profileImage ? files.profileImage[0] : undefined;
    const headerImage = files.headerImage ? files.headerImage[0] : undefined;
    const footerImage = files.footerImage ? files.footerImage[0] : undefined;
    const galleryImages = files.gallery || [];

    this.logger.log(
      `Appel de deleteGalleryImages avec les images à supprimer: ${updateUnitDto.galleryImagesToDelete}`,
    );

    // Suppression des images de la galerie
    if (
      updateUnitDto.galleryImagesToDelete &&
      updateUnitDto.galleryImagesToDelete.length > 0
    ) {
      for (const uploadId of updateUnitDto.galleryImagesToDelete) {
        this.logger.log(
          `Tentative de suppression de l'upload avec l'ID : ${uploadId}`,
        );

        try {
          const upload = await this.unitService.deleteGalleryImage(
            parseInt(uploadId),
          );
          this.logger.log(`Upload supprimé avec succès : ${upload.id}`);
        } catch (error) {
          this.logger.error(
            `Erreur lors de la suppression de l'upload avec l'ID : ${uploadId}`,
            error,
          );
        }
      }
    }

    try {
      const result = await this.unitService.update(
        +id,
        updateUnitDto,
        req.user.id,
        profileImage,
        galleryImages,
        headerImage,
        footerImage,
      );

      this.logger.log(`Mise à jour de l'unité réussie pour l'ID : ${id}`);
      return result;
    } catch (error) {
      this.logger.error(
        `Erreur lors de la mise à jour de l'unité avec l'ID : ${id}`,
        error,
      );
      throw error; // Lancer à nouveau l'erreur pour l'affichage dans les logs
    }
  }

  @Delete(':id')
  @Roles('ADMIN', 'EDITOR')
  @UseGuards(JwtAuthGuard, RoleGuard)
  async remove(@Param('id') id: string) {
    try {
      const result = await this.unitService.remove(+id);
      this.logger.log(`Suppression de l'unité réussie pour l'ID : ${id}`);
      return result;
    } catch (error) {
      this.logger.error(
        `Erreur lors de la suppression de l'unité avec l'ID : ${id}`,
        error,
      );
      throw error;
    }
  }

  @Delete('gallery/:uploadId')
  @Roles('ADMIN', 'EDITOR')
  @UseGuards(JwtAuthGuard, RoleGuard)
  async deleteGalleryImage(@Param('uploadId') uploadId: string) {
    try {
      this.logger.log(
        `Tentative de suppression de l'image de galerie avec l'ID : ${uploadId}`,
      );
      const result = await this.unitService.deleteGalleryImage(+uploadId);
      this.logger.log(
        `Suppression de l'image de galerie réussie pour l'ID : ${uploadId}`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `Erreur lors de la suppression de l'image de galerie avec l'ID : ${uploadId}`,
        error,
      );
      throw error;
    }
  }
}
