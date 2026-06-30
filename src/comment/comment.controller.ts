import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto, UpdateCommentDto } from './dto/comment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RoleGuard } from '../auth/role.guard';
import { Roles } from '../auth/roles.decorator';
import { Request } from 'express';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('comments')
@ApiBearerAuth()
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateCommentDto, @Req() req: Request) {
    const user = req.user as any;
    return this.commentService.create(dto, user.id);
  }

  @Get()
  findByResource(
    @Query('postId') postId?: string,
    @Query('unitId') unitId?: string,
    @Query('classId') classId?: string,
    @Query('tutorialId') tutorialId?: string,
  ) {
    return this.commentService.findByResource(
      postId ? +postId : undefined,
      unitId ? +unitId : undefined,
      classId,
      tutorialId ? +tutorialId : undefined,
    );
  }

  @Get('all')
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RoleGuard)
  findAll() {
    return this.commentService.findAll();
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCommentDto,
    @Req() req: Request,
  ) {
    const user = req.user as any;
    return this.commentService.update(+id, dto, user.id, user.role);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as any;
    return this.commentService.remove(+id, user.id, user.role);
  }
}
