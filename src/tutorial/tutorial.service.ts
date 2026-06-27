import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTutorialDto, UpdateTutorialDto } from './dto/tutorial.dto';

@Injectable()
export class TutorialService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.tutorial.findMany({ orderBy: { createdAt: 'desc' } });
  }

  findPublished() {
    return this.prisma.tutorial.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: number) {
    return this.prisma.tutorial.findUnique({ where: { id } });
  }

  create(dto: CreateTutorialDto) {
    return this.prisma.tutorial.create({ data: dto });
  }

  update(id: number, dto: UpdateTutorialDto) {
    return this.prisma.tutorial.update({ where: { id }, data: dto });
  }

  remove(id: number) {
    return this.prisma.tutorial.delete({ where: { id } });
  }
}
