import { Module } from '@nestjs/common';
import { UnitService } from './unit.service';
import { UnitController } from './unit.controller';
import { PrismaService } from '../prisma/prisma.service';
import { UploadModule } from '../upload/upload.module'; // Assurez-vous d'importer le module Upload
import { AuthModule } from '../auth/auth.module'; // Importez AuthModule
import { FileModule } from '../files/file.module';

@Module({
  imports: [UploadModule, AuthModule, FileModule], // Ajoutez AuthModule ici
  controllers: [UnitController],
  providers: [UnitService, PrismaService],
})
export class UnitModule {}
