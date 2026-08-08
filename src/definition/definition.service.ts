import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDefinitionDto, UpdateDefinitionDto } from './dto/definition.dto';
import { publicationFilter } from '../common/publication.util';

@Injectable()
export class DefinitionService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.definition.findMany({ orderBy: { term: 'asc' } });
  }

  findPublished(isPrivileged: boolean) {
    return this.prisma.definition.findMany({
      where: publicationFilter(isPrivileged),
      orderBy: { term: 'asc' },
    });
  }

  async findOne(id: number, isPrivileged: boolean) {
    const definition = await this.prisma.definition.findFirst({
      where: { id, ...publicationFilter(isPrivileged) },
    });

    if (!definition) {
      throw new NotFoundException('Definition not found');
    }

    return definition;
  }

  create(dto: CreateDefinitionDto) {
    return this.prisma.definition.create({
      data: {
        ...dto,
        publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : null,
      },
    });
  }

  update(id: number, dto: UpdateDefinitionDto) {
    const { publishedAt, ...rest } = dto;
    return this.prisma.definition.update({
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
    return this.prisma.definition.delete({ where: { id } });
  }
}
