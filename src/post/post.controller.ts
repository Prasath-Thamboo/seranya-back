// spectral5.0/src/post/post.controller.ts

import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Delete,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Req,
  Logger,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto, UpdatePostDto } from './dto/post.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RoleGuard } from '../auth/role.guard';
import { Roles } from '../auth/roles.decorator';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { Request } from 'express';
import { memoryStorage } from 'multer';

const storage = memoryStorage(); // Utilisation du stockage en mémoire pour Multer

@Controller('posts')
@ApiBearerAuth()
export class PostController {
  private readonly logger = new Logger(PostController.name);

  constructor(private readonly postService: PostService) {}

  @Get()
  findAll() {
    return this.postService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postService.findOne(+id);
  }

  // Nouveau Endpoint : GET /posts/regions
  @Get('regions')
  findAllRegions() {
    return this.postService.findAllRegions();
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
        { name: 'gallery', maxCount: 10 },
      ],
      { storage },
    ),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: "Création d'un post avec téléchargement de fichiers",
    type: CreatePostDto,
  })
  async create(
    @Req() req: Request,
    @UploadedFiles()
    files: {
      profileImage?: Express.Multer.File[];
      headerImage?: Express.Multer.File[];
      footerImage?: Express.Multer.File[];
      gallery?: Express.Multer.File[];
    },
    @Body() createPostDto: CreatePostDto,
  ) {
    const profileImage = files.profileImage ? files.profileImage[0] : undefined;
    const headerImage = files.headerImage ? files.headerImage[0] : undefined;
    const footerImage = files.footerImage ? files.footerImage[0] : undefined;
    const galleryImages = files.gallery || [];

    return this.postService.create(
      createPostDto,
      profileImage,
      headerImage,
      footerImage,
      galleryImages,
    );
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
        { name: 'gallery', maxCount: 10 },
      ],
      { storage },
    ),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: "Mise à jour d'un post avec téléchargement de fichiers",
    type: UpdatePostDto,
  })
  async update(
    @Param('id') id: string,
    @Req() req: Request,
    @UploadedFiles()
    files: {
      profileImage?: Express.Multer.File[];
      headerImage?: Express.Multer.File[];
      footerImage?: Express.Multer.File[];
      gallery?: Express.Multer.File[];
    },
    @Body() updatePostDto: any,
  ) {
    // Convertir les champs en tableaux s'ils ne le sont pas déjà
    if (updatePostDto.unitIds && !Array.isArray(updatePostDto.unitIds)) {
      updatePostDto.unitIds = [updatePostDto.unitIds];
    }

    if (updatePostDto.classIds && !Array.isArray(updatePostDto.classIds)) {
      updatePostDto.classIds = [updatePostDto.classIds];
    }

    if (
      updatePostDto.galleryImagesToDelete &&
      !Array.isArray(updatePostDto.galleryImagesToDelete)
    ) {
      updatePostDto.galleryImagesToDelete = [
        updatePostDto.galleryImagesToDelete,
      ];
    }

    // Continuer avec le traitement habituel
    const profileImage = files.profileImage ? files.profileImage[0] : undefined;
    const headerImage = files.headerImage ? files.headerImage[0] : undefined;
    const footerImage = files.footerImage ? files.footerImage[0] : undefined;
    const galleryImages = files.gallery || [];

    return this.postService.update(
      +id,
      updatePostDto,
      profileImage,
      headerImage,
      footerImage,
      galleryImages,
      updatePostDto.galleryImagesToDelete,
    );
  }

  @Delete(':id')
  @Roles('ADMIN', 'EDITOR')
  @UseGuards(JwtAuthGuard, RoleGuard)
  async remove(@Param('id') id: string) {
    return this.postService.remove(+id);
  }
}
