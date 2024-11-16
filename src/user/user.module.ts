import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaModule } from '../prisma/prisma.module';
import { MailerService } from 'src/mailer/mailer.service';

@Module({
  imports: [PrismaModule],
  controllers: [UserController],
  providers: [UserService, MailerService],
})
export class UserModule {}
