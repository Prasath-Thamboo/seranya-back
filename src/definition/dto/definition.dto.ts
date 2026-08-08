import { IsOptional, IsDateString } from 'class-validator';

export class CreateDefinitionDto {
  term: string;
  definition: string;
  category?: string;
  isPublished?: boolean;

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
  @IsDateString()
  publishedAt?: string;
}
