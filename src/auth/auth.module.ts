import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from '../prisma/prisma.service';
import { MailerService } from '../mailer/mailer.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy'; // Optionnel : si vous utilisez JwtStrategy pour l'authentification

@Module({
  imports: [
    JwtModule.register({
      secret: 'yourSecretKey', // Remplacez par votre clé secrète JWT
      signOptions: { expiresIn: '1h' }, // Configuration du token JWT
    }),
  ],
  providers: [AuthService, PrismaService, MailerService, JwtStrategy],
  controllers: [AuthController],
  exports: [JwtModule, AuthService], // Exporte JwtModule pour être utilisé dans d'autres modules
})
export class AuthModule {}
