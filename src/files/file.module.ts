import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { PrismaModule } from '../prisma/prisma.module'; // Importer PrismaModule

@Module({
  imports: [PrismaModule], // Importer PrismaModule pour accéder à PrismaService
  providers: [FileService],
  controllers: [FileController], // Inclure FileController
  exports: [FileService], // Exporter FileService pour qu'il soit accessible dans d'autres modules
})
export class FileModule {}
