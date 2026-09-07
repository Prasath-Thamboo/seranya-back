import { IsOptional, IsDateString, IsString } from 'class-validator';

export class CreateDefinitionDto {
  term: string;
  definition: string;
  category?: string;
  isPublished?: boolean;

  @IsOptional()
  @IsString()
  termEn?: string;

  @IsOptional()
  @IsString()
  definitionEn?: string;

  @IsOptional()
  @IsString()
  categoryEn?: string;

  @IsOptional()
  @IsDateString()
  publishedAt?: string;
}

export class UpdateDefinitionDto {
  term?: string;
  definition?: string;
  category?: string;
  isPublished?: boolean;

  @IsOptional()
  @IsString()
  termEn?: string;

  @IsOptional()
  @IsString()
  definitionEn?: string;

  @IsOptional()
  @IsString()
  categoryEn?: string;

  @IsOptional()
  @IsDateString()
  publishedAt?: string;
}
