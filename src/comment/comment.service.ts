import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto, UpdateCommentDto } from './dto/comment.dto';

@Injectable()
export class CommentService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCommentDto, userId: number) {
    return this.prisma.comment.create({
      data: {
        content: dto.content,
        userId,
        postId: dto.postId ?? null,
        unitId: dto.unitId ?? null,
        classId: dto.classId ?? null,
        tutorialId: dto.tutorialId ?? null,
      },
      include: {
        user: { select: { id: true, pseudo: true, profileImage: true, role: true } },
      },
    });
  }

  async findByResource(
    postId?: number,
    unitId?: number,
    classId?: string,
    tutorialId?: number,
  ) {
    return this.prisma.comment.findMany({
      where: {
        ...(postId ? { postId } : {}),
        ...(unitId ? { unitId } : {}),
        ...(classId ? { classId } : {}),
        ...(tutorialId ? { tutorialId } : {}),
      },
      include: {
        user: { select: { id: true, pseudo: true, profileImage: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAll() {
    return this.prisma.comment.findMany({
      include: {
        user: { select: { id: true, pseudo: true, role: true } },
        post: { select: { id: true, title: true } },
        unit: { select: { id: true, title: true } },
        class: { select: { id: true, title: true } },
        tutorial: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: number, dto: UpdateCommentDto, userId: number, userRole: string) {
    const comment = await this.prisma.comment.findUnique({ where: { id } });
    if (!comment) throw new NotFoundException('Commentaire introuvable');
    if (comment.userId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('Action non autorisée');
    }
    return this.prisma.comment.update({
      where: { id },
      data: { content: dto.content },
      include: {
        user: { select: { id: true, pseudo: true, profileImage: true, role: true } },
      },
    });
  }

  async remove(id: number, userId: number, userRole: string) {
    const comment = await this.prisma.comment.findUnique({ where: { id } });
    if (!comment) throw new NotFoundException('Commentaire introuvable');
    if (comment.userId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('Action non autorisée');
    }
    return this.prisma.comment.delete({ where: { id } });
  }
}
