// spectral5.0/src/class/class.controller.ts

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
import { ClassService } from './class.service';
import { CreateClassDto, UpdateClassDto } from './dto/class.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RoleGuard } from '../auth/role.guard';
import { Roles } from '../auth/roles.decorator';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { Request } from 'express';
import { memoryStorage } from 'multer';

@Controller('classes')
@ApiBearerAuth()
export class ClassController {
  private readonly logger = new Logger(ClassController.name);

  constructor(private readonly classService: ClassService) {}

  @Get()
  findAll() {
    return this.classService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.classService.findOne(id);
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
      { storage: memoryStorage() }, // Utilisation du stockage en mémoire
    ),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: "Création d'une classe avec téléchargement de fichiers",
    type: CreateClassDto,
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
    @Body() createClassDto: CreateClassDto,
  ) {
    const profileImage = files.profileImage ? files.profileImage[0] : undefined;
    const headerImage = files.headerImage ? files.headerImage[0] : undefined;
    const footerImage = files.footerImage ? files.footerImage[0] : undefined;
    const galleryImages = files.gallery || [];

    return this.classService.create(
      createClassDto,
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
      { storage: memoryStorage() }, // Utilisation du stockage en mémoire
    ),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: "Mise à jour d'une classe avec téléchargement de fichiers",
    type: UpdateClassDto,
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
    @Body() updateClassDto: UpdateClassDto,
  ) {
    const profileImage = files.profileImage ? files.profileImage[0] : undefined;
    const headerImage = files.headerImage ? files.headerImage[0] : undefined;
    const footerImage = files.footerImage ? files.footerImage[0] : undefined;
    const galleryImages = files.gallery || [];

    return this.classService.update(
      id,
      updateClassDto,
      profileImage,
      headerImage,
      footerImage,
      galleryImages,
      updateClassDto.galleryImagesToDelete,
    );
  }

  @Delete(':id')
  @Roles('ADMIN', 'EDITOR')
  @UseGuards(JwtAuthGuard, RoleGuard)
  async remove(@Param('id') id: string) {
    return this.classService.remove(id);
  }
}
