import { IsOptional, IsDateString } from 'class-validator';

export class CreateTutorialDto {
  title: string;
  description?: string;
  videoUrl: string;
  isPublished?: boolean;

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
  @IsDateString()
  publishedAt?: string;
}
