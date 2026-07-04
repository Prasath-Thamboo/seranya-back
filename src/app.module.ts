import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
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
import { CommentModule } from './comment/comment.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000, // 1 minute
        limit: 100, // 100 requêtes / minute / IP sur l'ensemble de l'API
      },
    ]),
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
    CommentModule,
  ],
  controllers: [AppController, WebhookController],
  providers: [
    MailerService,
    AppService,
    PrismaService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
  exports: [MailerService],
})
export class AppModule {}
