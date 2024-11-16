// spectral5.0/src/class/dto/class.dto.ts
import { ApiProperty } from '@nestjs/swagger'; // Assurez-vous d'importer l'enum UploadType

export class CreateClassDto {
  @ApiProperty()
  title: string;

  @ApiProperty()
  intro: string;

  @ApiProperty({ required: false })
  subtitle?: string;

  @ApiProperty({ required: false })
  story?: string;

  @ApiProperty({ required: false })
  bio?: string;

  @ApiProperty({ required: false })
  isPublished?: boolean;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  profileImage?: Express.Multer.File;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  headerImage?: Express.Multer.File;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  footerImage?: Express.Multer.File;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    isArray: true,
    required: false,
  })
  gallery?: Express.Multer.File[];

  // Ajout de la propriété unitIds pour lier la classe à des unités
  @ApiProperty({ isArray: true, type: Number, required: false })
  unitIds?: number[];

  @ApiProperty({ required: false })
  color?: string; // Ajout de la propriété couleur

  @ApiProperty({ required: false })
  quote?: string; // Ajout de la propriété quote
}

export class UpdateClassDto extends CreateClassDto {
  @ApiProperty({ isArray: true, required: false })
  galleryImagesToDelete?: string[];
}
