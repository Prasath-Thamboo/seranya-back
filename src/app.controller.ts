import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RoleGuard } from './auth/role.guard';
import { Roles } from './auth/roles.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('search')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN', 'EDITOR')
  async search(@Query('q') q: string) {
    if (!q || q.trim().length < 2) return { posts: [], tutorials: [], definitions: [], users: [] };
    return this.appService.search(q.trim());
  }
}
