import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaModule } from '../prisma/prisma.module';
import { MailerService } from 'src/mailer/mailer.service';
import { FileModule } from '../files/file.module';

@Module({
  imports: [PrismaModule, FileModule],
  controllers: [UserController],
  providers: [UserService, MailerService],
})
export class UserModule {}
