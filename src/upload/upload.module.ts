import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { UploadService } from './upload.service';

@Module({
  imports: [
    MulterModule.register({
      dest: './uploads', // Répertoire où les fichiers seront stockés
    }),
  ],
  providers: [UploadService],
  exports: [MulterModule, UploadService], // Exportez MulterModule pour l'utiliser dans d'autres modules
})
export class UploadModule {}
