import {
  Controller,
  Post,
  Get,
  Body,
  Delete,
  UseInterceptors,
  Headers,
  Req,
  UseGuards,
  Logger,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  RegisterUserDto,
  LoginUserDto,
  ResetPasswordDto,
} from './dto/auth.dto';
import { ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @UseInterceptors(FileInterceptor('profileImage'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: RegisterUserDto })
  async register(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.register(registerUserDto);
  }

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiBody({ type: LoginUserDto })
  async login(@Body() loginUserDto: LoginUserDto) {
    const token = await this.authService.login(loginUserDto);
    this.logger.debug('Token generated:', token); // Log du token généré
    return {
      message: 'Login successful',
      token, // Inclure le token directement ici
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@Req() req: any) {
    this.logger.debug('JWT Payload:', req.user); // Log du payload du JWT
    this.logger.debug('User ID from token:', req.user.id); // Use 'id' instead of 'userId'
    return this.authService.getUser(req.user.id); // Pass the correct property to getUser
  }

  @Post('logout')
  @ApiConsumes('application/x-www-form-urlencoded')
  async logout(@Headers('Authorization') authHeader: string) {
    this.logger.debug('Authorization Header:', authHeader); // Log de l'en-tête Authorization
    const token = authHeader.split(' ')[1]; // Extraire le token du header
    this.logger.debug('Token extracted:', token); // Log du token extrait
    return this.authService.logout(token);
  }

  @Delete('delete')
  @UseGuards(JwtAuthGuard)
  @ApiConsumes('application/x-www-form-urlencoded')
  async deleteAccount(@Req() req: any) {
    const result = await this.authService.deleteAccount(req.user.id);
    return {
      message: 'Account deleted successfully',
      result,
    };
  }

  @Post('generate-reset-token')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async generateResetToken(@Body('email') email: string) {
    await this.authService.generateResetToken(email);
    return {
      message:
        'Si cet email est enregistré, un lien de réinitialisation vient de lui être envoyé.',
    };
  }

  @Post('reset-password')
  @ApiBody({ type: ResetPasswordDto })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    const result = await this.authService.resetPassword(resetPasswordDto);
    return {
      message: 'Password reset successfully',
      result,
    };
  }

  @Get('confirm')
  async confirmEmail(@Query('token') token: string) {
    try {
      const user = await this.authService.confirmEmail(token);
      return { message: 'Confirmation réussie.', user };
    } catch (error) {
      Logger.error(
        `Erreur lors de la confirmation de l'utilisateur: ${error.message}`,
      );
      throw new UnauthorizedException('La confirmation a échoué.');
    }
  }
}
