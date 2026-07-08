import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Req,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RoleGuard } from '../auth/role.guard';
import { Request } from 'express';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'The user has been successfully created.' })
  @ApiBody({ type: CreateUserDto })
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Return all users.' })
  findAll() {
    return this.userService.findAll();
  }

  @Get('check-pseudo')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Check pseudo availability' })
  async checkPseudo(
    @Query('pseudo') pseudo: string,
    @Req() req: Request & { user: { id: number } },
  ) {
    if (!pseudo) return { available: false, reason: 'Pseudo manquant.' };
    const format = this.userService.validatePseudoFormat(pseudo);
    if (!format.valid) return { available: false, reason: format.reason };
    return this.userService.isPseudoAvailable(pseudo, req.user.id);
  }

  @Get('confirm-email-change')
  @ApiOperation({ summary: 'Confirm an email change via token' })
  async confirmEmailChange(@Query('token') token: string) {
    const user = await this.userService.confirmEmailChange(token);
    return { message: 'Adresse email mise à jour avec succès.', user };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get a user by ID (admin only)' })
  @ApiResponse({ status: 200, description: 'Return a user.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update own profile (any authenticated user)' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: 'Profile updated.' })
  @UseInterceptors(FileInterceptor('profileImage', { storage: memoryStorage() }))
  async updateMe(
    @Req() req: Request & { user: { id: number } },
    @Body() body: { name?: string; lastName?: string; pseudo?: string },
    @UploadedFile() profileImage?: Express.Multer.File,
  ) {
    const { name, lastName, pseudo } = body;

    if (pseudo) {
      const format = this.userService.validatePseudoFormat(pseudo);
      if (!format.valid) throw new BadRequestException(format.reason);
      const { available } = await this.userService.isPseudoAvailable(pseudo, req.user.id);
      if (!available) throw new BadRequestException('Ce pseudo est déjà utilisé.');
    }

    return this.userService.update(req.user.id, { name, lastName, pseudo }, profileImage);
  }

  @Post('me/change-email')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Request an email change (sends a confirmation link to the new address)' })
  async requestEmailChange(
    @Req() req: Request & { user: { id: number } },
    @Body('newEmail') newEmail: string,
  ) {
    if (!newEmail) throw new BadRequestException('Adresse email manquante.');
    await this.userService.requestEmailChange(req.user.id, newEmail);
    return { message: 'Un email de confirmation a été envoyé à la nouvelle adresse.' };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update a user' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: 'The user has been successfully updated.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiBody({ type: UpdateUserDto })
  @UseInterceptors(FileInterceptor('profileImage', { storage: memoryStorage() }))
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() profileImage?: Express.Multer.File,
  ) {
    return this.userService.update(+id, updateUserDto, profileImage);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Delete a user' })
  @ApiResponse({ status: 200, description: 'The user has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }

  @Post('send-email')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Send a simple email' })
  @ApiResponse({ status: 200, description: 'Email has been successfully sent.' })
  async sendEmail(
    @Body() { to, subject, text }: { to: string; subject: string; text: string },
  ) {
    await this.userService.send(to, subject, text);
    return { message: 'Email has been successfully sent.' };
  }
}
