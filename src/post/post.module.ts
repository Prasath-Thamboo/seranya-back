// spectral5.0/src/post/post.module.ts

import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { PrismaService } from '../prisma/prisma.service';
import { FileService } from '../files/file.service';

@Module({
  imports: [],
  controllers: [PostController],
  providers: [PostService, PrismaService, FileService],
})
export class PostModule {}
