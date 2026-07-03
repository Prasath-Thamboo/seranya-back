import { Module } from '@nestjs/common';
import { UnitService } from './unit.service';
import { UnitController } from './unit.controller';
import { PrismaService } from '../prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';
import { FileModule } from '../files/file.module';

@Module({
  imports: [AuthModule, FileModule],
  controllers: [UnitController],
  providers: [UnitService, PrismaService],
})
export class UnitModule {}
