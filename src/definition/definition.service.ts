import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDefinitionDto, UpdateDefinitionDto } from './dto/definition.dto';

@Injectable()
export class DefinitionService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.definition.findMany({ orderBy: { term: 'asc' } });
  }

  findPublished() {
    return this.prisma.definition.findMany({
      where: { isPublished: true },
      orderBy: { term: 'asc' },
    });
  }

  findOne(id: number) {
    return this.prisma.definition.findUnique({ where: { id } });
  }

  create(dto: CreateDefinitionDto) {
    return this.prisma.definition.create({ data: dto });
  }

  update(id: number, dto: UpdateDefinitionDto) {
    return this.prisma.definition.update({ where: { id }, data: dto });
  }

  remove(id: number) {
    return this.prisma.definition.delete({ where: { id } });
  }
}
