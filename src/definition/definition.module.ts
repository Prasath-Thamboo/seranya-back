import { Module } from '@nestjs/common';
import { DefinitionService } from './definition.service';
import { DefinitionController } from './definition.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DefinitionController],
  providers: [DefinitionService],
})
export class DefinitionModule {}
