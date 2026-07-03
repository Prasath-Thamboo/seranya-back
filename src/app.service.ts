import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  getHello(): string {
    return 'Hello World!';
  }

  async search(q: string) {
    const term = { contains: q, mode: 'insensitive' as const };

    const [posts, tutorials, definitions, users] = await Promise.all([
      this.prisma.post.findMany({
        where: { OR: [{ title: term }, { intro: term }, { subtitle: term }] },
        select: { id: true, title: true, intro: true, type: true, isPublished: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      this.prisma.tutorial.findMany({
        where: { OR: [{ title: term }, { description: term }] },
        select: { id: true, title: true, description: true, isPublished: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      this.prisma.definition.findMany({
        where: { OR: [{ term: term }, { definition: term }, { category: term }] },
        select: { id: true, term: true, category: true, isPublished: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      this.prisma.user.findMany({
        where: { OR: [{ pseudo: term }, { email: term }, { name: term }] },
        select: { id: true, pseudo: true, email: true, role: true, status: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    return { posts, tutorials, definitions, users };
  }
}
