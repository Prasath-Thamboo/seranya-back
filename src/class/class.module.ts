import { Module } from '@nestjs/common';
import { ClassController } from './class.controller';
import { ClassService } from './class.service';
import { FileModule } from '../files/file.module';

@Module({
  imports: [FileModule],
  controllers: [ClassController],
  providers: [ClassService],
})
export class ClassModule {}

//
