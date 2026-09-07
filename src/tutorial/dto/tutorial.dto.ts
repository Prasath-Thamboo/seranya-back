import { IsOptional, IsDateString, IsString } from 'class-validator';

export class CreateTutorialDto {
  title: string;
  description?: string;
  videoUrl: string;
  isPublished?: boolean;

  @IsOptional()
  @IsString()
  titleEn?: string;

  @IsOptional()
  @IsString()
  descriptionEn?: string;

  @IsOptional()
  @IsDateString()
  publishedAt?: string;
}

export class UpdateTutorialDto {
  title?: string;
  description?: string;
  videoUrl?: string;
  isPublished?: boolean;

  @IsOptional()
  @IsString()
  titleEn?: string;

  @IsOptional()
  @IsString()
  descriptionEn?: string;

  @IsOptional()
  @IsDateString()
  publishedAt?: string;
}
