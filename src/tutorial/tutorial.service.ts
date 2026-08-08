import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTutorialDto, UpdateTutorialDto } from './dto/tutorial.dto';
import { publicationFilter } from '../common/publication.util';

@Injectable()
export class TutorialService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.tutorial.findMany({ orderBy: { createdAt: 'desc' } });
  }

  findPublished(isPrivileged: boolean) {
    return this.prisma.tutorial.findMany({
      where: publicationFilter(isPrivileged),
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number, isPrivileged: boolean) {
    const tutorial = await this.prisma.tutorial.findFirst({
      where: { id, ...publicationFilter(isPrivileged) },
    });

    if (!tutorial) {
      throw new NotFoundException('Tutorial not found');
    }

    return tutorial;
  }

  create(dto: CreateTutorialDto) {
    return this.prisma.tutorial.create({
      data: {
        ...dto,
        publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : null,
      },
    });
  }

  update(id: number, dto: UpdateTutorialDto) {
    const { publishedAt, ...rest } = dto;
    return this.prisma.tutorial.update({
      where: { id },
      data: {
        ...rest,
        ...(publishedAt !== undefined && {
          publishedAt: publishedAt ? new Date(publishedAt) : null,
        }),
      },
    });
  }

  remove(id: number) {
    return this.prisma.tutorial.delete({ where: { id } });
  }
}
