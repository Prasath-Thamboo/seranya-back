import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { UnitModule } from './unit/unit.module';
import { ClassModule } from './class/class.module';
import { PostModule } from './post/post.module';
import { PrismaModule } from './prisma/prisma.module';
import { PrismaService } from './prisma/prisma.service';
import { MailerService } from './mailer/mailer.service';
import { MailerModule } from './mailer/mailer.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { PaymentModule } from './payments/payment.module';
import { WebhookController } from './payments/webhook.controller';
import { FileModule } from './files/file.module';
import { TutorialModule } from './tutorial/tutorial.module';
import { DefinitionModule } from './definition/definition.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    UserModule,
    UnitModule,
    ClassModule,
    PostModule,
    PrismaModule,
    MailerModule,
    AuthModule,
    PaymentModule,
    FileModule,
    TutorialModule,
    DefinitionModule,
  ],
  controllers: [AppController, WebhookController],
  providers: [MailerService, AppService, PrismaService],
  exports: [MailerService],
})
export class AppModule {}
