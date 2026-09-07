import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { DefinitionService } from './definition.service';
import { CreateDefinitionDto, UpdateDefinitionDto } from './dto/definition.dto';
import { resolveLang } from '../common/i18n.util';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { RoleGuard } from '../auth/role.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('definitions')
export class DefinitionController {
  constructor(private readonly definitionService: DefinitionService) {}

  private isPrivileged(req: Request): boolean {
    const user = req.user as any;
    return user?.role === 'ADMIN' || user?.role === 'EDITOR';
  }

  @Get('published')
  @UseGuards(OptionalJwtAuthGuard)
  findPublished(@Req() req: Request, @Query('lang') lang?: string) {
    return this.definitionService.findPublished(
      this.isPrivileged(req),
      lang ? resolveLang(lang) : undefined,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN', 'EDITOR')
  findAll() {
    return this.definitionService.findAll();
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  findOne(
    @Param('id') id: string,
    @Req() req: Request,
    @Query('lang') lang?: string,
  ) {
    return this.definitionService.findOne(
      +id,
      this.isPrivileged(req),
      lang ? resolveLang(lang) : undefined,
    );
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
