import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTutorialDto, UpdateTutorialDto } from './dto/tutorial.dto';
import { publicationFilter } from '../common/publication.util';

// Même extraction que côté frontend (UniversClient/TutorielsClient) : on ne
// garde que l'ID de la vidéo pour fabriquer une miniature, jamais l'URL
// complète, quand l'utilisateur n'a pas le droit de la regarder.
function getYouTubeThumbnail(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|v=|embed\/)([^#&?]{11})/);
  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null;
}

// L'URL de la vidéo ne doit jamais transiter vers un client qui n'a pas le
// droit de la regarder : un non-abonné ne doit pas pouvoir la récupérer en
// lisant la réponse réseau, seule une miniature est fournie à la place.
function withAccessControl<T extends { videoUrl: string }>(
  tutorial: T,
  canWatch: boolean,
) {
  const { videoUrl, ...rest } = tutorial;
  return {
    ...rest,
    videoUrl: canWatch ? videoUrl : null,
    thumbnailUrl: getYouTubeThumbnail(videoUrl),
  };
}

@Injectable()
export class TutorialService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.tutorial.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findPublished(isPrivileged: boolean, canWatch: boolean) {
    const tutorials = await this.prisma.tutorial.findMany({
      where: publicationFilter(isPrivileged),
      orderBy: { createdAt: 'desc' },
    });

    return tutorials.map((tutorial) => withAccessControl(tutorial, canWatch));
  }

  async findOne(id: number, isPrivileged: boolean, canWatch: boolean) {
    const tutorial = await this.prisma.tutorial.findFirst({
      where: { id, ...publicationFilter(isPrivileged) },
    });

    if (!tutorial) {
      throw new NotFoundException('Tutorial not found');
    }

    return withAccessControl(tutorial, canWatch);
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
