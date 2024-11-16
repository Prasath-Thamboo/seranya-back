// spectral5.0/src/unit/dto/unit.dto.ts

import { ApiPropertyOptional } from '@nestjs/swagger';
import { UnitType } from '@prisma/client';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsArray,
} from 'class-validator';

// DTO pour la création d'une unité
export class CreateUnitDto {
  @ApiPropertyOptional({ description: 'Titre de l’unité' })
  @IsString()
  @IsOptional()
  title: string;

  @ApiPropertyOptional({ description: 'Introduction de l’unité' })
  @IsString()
  @IsOptional()
  intro: string;

  @ApiPropertyOptional({ description: 'Sous-titre de l’unité' })
  @IsOptional()
  @IsString()
  subtitle?: string;

  @ApiPropertyOptional({ description: 'Histoire de l’unité' })
  @IsOptional()
  @IsString()
  story?: string;

  @ApiPropertyOptional({ description: 'Biographie de l’unité' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ description: 'Citation de l’unité' })
  @IsOptional()
  @IsString()
  quote?: string;

  @ApiPropertyOptional({ description: 'Couleur de l’unité' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ description: 'Statut de publication' })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({ description: 'Type d’unité', enum: UnitType })
  @IsOptional()
  @IsEnum(UnitType)
  type?: UnitType;

  @ApiPropertyOptional({
    description: 'ID de la classe associée',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsArray()
  classIds?: string[]; // Mise à jour pour accepter plusieurs classIds
}

// DTO pour la mise à jour d'une unité
export class UpdateUnitDto {
  @ApiPropertyOptional({ description: 'Titre de l’unité' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Introduction de l’unité' })
  @IsOptional()
  @IsString()
  intro?: string;

  @ApiPropertyOptional({ description: 'Sous-titre de l’unité' })
  @IsOptional()
  @IsString()
  subtitle?: string;

  @ApiPropertyOptional({ description: 'Histoire de l’unité' })
  @IsOptional()
  @IsString()
  story?: string;

  @ApiPropertyOptional({ description: 'Biographie de l’unité' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ description: 'Citation de l’unité' })
  @IsOptional()
  @IsString()
  quote?: string;

  @ApiPropertyOptional({ description: 'Couleur de l’unité' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ description: 'Statut de publication' })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({ description: 'Type d’unité', enum: UnitType })
  @IsOptional()
  @IsEnum(UnitType)
  type?: UnitType;

  @ApiPropertyOptional({
    description: 'Images de galerie à supprimer',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  galleryImagesToDelete?: string[];

  @ApiPropertyOptional({
    description: 'ID de la classe associée',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsArray()
  classIds?: string[]; // Mise à jour pour accepter plusieurs classIds
}
