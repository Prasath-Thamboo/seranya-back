import { Module } from '@nestjs/common';
import { TutorialService } from './tutorial.service';
import { TutorialController } from './tutorial.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TutorialController],
  providers: [TutorialService],
})
export class TutorialModule {}
