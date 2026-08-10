import { Controller, Get, Post, Patch, Delete, Param, Body, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { TutorialService } from './tutorial.service';
import { CreateTutorialDto, UpdateTutorialDto } from './dto/tutorial.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { RoleGuard } from '../auth/role.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('tutorials')
export class TutorialController {
  constructor(private readonly tutorialService: TutorialService) {}

  private isPrivileged(req: Request): boolean {
    const user = req.user as any;
    return user?.role === 'ADMIN' || user?.role === 'EDITOR';
  }

  // Qui a le droit de regarder la vidéo : ADMIN/EDITOR (le rôle EDITOR n'est
  // accordé que via un abonnement, cf. webhook.controller.ts) ou un USER
  // marqué isSubscribed directement par un admin.
  private canWatch(req: Request): boolean {
    const user = req.user as any;
    return this.isPrivileged(req) || !!user?.isSubscribed;
  }

  @Get('published')
  @UseGuards(OptionalJwtAuthGuard)
  findPublished(@Req() req: Request) {
    return this.tutorialService.findPublished(
      this.isPrivileged(req),
      this.canWatch(req),
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN', 'EDITOR')
  findAll() {
    return this.tutorialService.findAll();
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  findOne(@Param('id') id: string, @Req() req: Request) {
    return this.tutorialService.findOne(
      +id,
      this.isPrivileged(req),
      this.canWatch(req),
    );
  }

  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN', 'EDITOR')
  create(@Body() dto: CreateTutorialDto) {
    return this.tutorialService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN', 'EDITOR')
  update(@Param('id') id: string, @Body() dto: UpdateTutorialDto) {
    return this.tutorialService.update(+id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN', 'EDITOR')
  remove(@Param('id') id: string) {
    return this.tutorialService.remove(+id);
  }
}
