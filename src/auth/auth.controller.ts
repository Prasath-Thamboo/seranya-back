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

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @UseInterceptors(FileInterceptor('profileImage'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: RegisterUserDto })
  async register(@Body() registerUserDto: RegisterUserDto) {
    const { user } = await this.authService.register(registerUserDto);

    const baseUrl =
      process.env.NODE_ENV === 'production'
        ? 'https://www.spectralunivers.com'
        : 'http://localhost:3000';

    const confirmationUrl = `${baseUrl}/auth/confirm?token=${user.confirmationToken}`;
    Logger.debug(`Confirmation URL générée : ${confirmationUrl}`);

    return {
      message: 'Un email de confirmation a été envoyé.',
      user,
    };
  }

  @Post('login')
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
  @ApiConsumes('application/x-www-form-urlencoded')
  async deleteAccount(@Body('email') email: string) {
    const result = await this.authService.deleteAccount(email);
    return {
      message: 'Account deleted successfully',
      result,
    };
  }

  @Post('generate-reset-token')
  @ApiConsumes('application/x-www-form-urlencoded')
  async generateResetToken(@Body('email') email: string) {
    const resetToken = await this.authService.generateResetToken(email);
    return {
      message:
        'Reset token generated successfully. Check your email for the link to reset your password.',
      resetToken,
    };
  }

  @Post('reset-password')
  @ApiConsumes('application/x-www-form-urlencoded')
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
