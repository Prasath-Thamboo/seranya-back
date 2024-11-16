// spectral5.0/src/post/dto/post.dto.ts

import {
  IsString,
  IsBoolean,
  IsOptional,
  IsEnum,
  IsArray,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Import des enums depuis Prisma
import { UploadType } from '@prisma/client'; // Assurez-vous que UploadType est importé si utilisé

export enum PostTypeEnum { // Renommage pour éviter les conflits avec Prisma enum
  SCIENCE = 'SCIENCE',
  PHILO = 'PHILO',
  UNIVERS = 'UNIVERS',
  REGION = 'REGION', // Ajout de la valeur REGION
}

export class CreatePostDto {
  @IsString()
  @ApiProperty()
  title: string;

  @IsString()
  @ApiProperty()
  intro: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  subtitle?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  color?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  content?: string;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ required: false })
  isPublished?: boolean;

  @IsEnum(PostTypeEnum)
  @IsOptional()
  @ApiPropertyOptional({
    enum: PostTypeEnum,
    description: 'Type de post (inclut REGION)',
  })
  type?: PostTypeEnum; // Si vous souhaitez que 'type' soit optionnel lors de la mise à jour

  @IsArray()
  @IsOptional()
  @Type(() => String)
  @ApiPropertyOptional({
    description: 'IDs des unités associées',
    type: 'array',
    items: { type: 'string' },
  })
  unitIds?: string[];

  @IsArray()
  @IsOptional()
  @Type(() => String)
  @ApiPropertyOptional({
    description: 'IDs des classes associées',
    type: 'array',
    items: { type: 'string' },
  })
  classIds?: string[];
}

export class UpdatePostDto extends PartialType(CreatePostDto) {
  @IsArray()
  @IsOptional()
  @Type(() => String)
  @ApiPropertyOptional({
    description: 'Images de galerie à supprimer',
    type: [String],
  })
  galleryImagesToDelete?: string[];
}

export class PostDto {
  id: number;
  title: string;
  intro: string;
  subtitle: string;
  content: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  type: PostTypeEnum; // Utilisation du nouvel enum
  units: UnitDto[];
  classes: ClassDto[];
  uploads: UploadDto[];
  comments: CommentDto[];
}

// Déclarations minimales des autres DTOs pour éviter les erreurs de compilation.
// Vous pouvez les remplacer par les imports réels si les fichiers correspondants existent.

export class UnitDto {
  id: number;
  title: string;
  quote?: string; // Inclure quote si nécessaire
  color?: string; // Inclure color si nécessaire
  // Autres champs du modèle Unit
}

export class ClassDto {
  id: string;
  title: string;
  quote?: string; // Inclure quote si nécessaire
  color?: string; // Inclure color si nécessaire
  // Autres champs du modèle Class
}

export class UploadDto {
  id: number;
  path: string;
  type: UploadType;
  // Autres champs du modèle Upload
}

export class CommentDto {
  id: number;
  content: string;
  // Autres champs du modèle Comment
}
