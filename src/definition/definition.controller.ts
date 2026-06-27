import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { DefinitionService } from './definition.service';
import { CreateDefinitionDto, UpdateDefinitionDto } from './dto/definition.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RoleGuard } from '../auth/role.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('definitions')
export class DefinitionController {
  constructor(private readonly definitionService: DefinitionService) {}

  @Get('published')
  findPublished() {
    return this.definitionService.findPublished();
  }

  @Get()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN', 'EDITOR')
  findAll() {
    return this.definitionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.definitionService.findOne(+id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN', 'EDITOR')
  create(@Body() dto: CreateDefinitionDto) {
    return this.definitionService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN', 'EDITOR')
  update(@Param('id') id: string, @Body() dto: UpdateDefinitionDto) {
    return this.definitionService.update(+id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN', 'EDITOR')
  remove(@Param('id') id: string) {
    return this.definitionService.remove(+id);
  }
}
