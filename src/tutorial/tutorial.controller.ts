import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { TutorialService } from './tutorial.service';
import { CreateTutorialDto, UpdateTutorialDto } from './dto/tutorial.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RoleGuard } from '../auth/role.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('tutorials')
export class TutorialController {
  constructor(private readonly tutorialService: TutorialService) {}

  @Get('published')
  findPublished() {
    return this.tutorialService.findPublished();
  }

  @Get()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN', 'EDITOR')
  findAll() {
    return this.tutorialService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tutorialService.findOne(+id);
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
