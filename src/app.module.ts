import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes the ConfigModule global
      envFilePath: '.env', // Specifies the path to your .env file
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'), // Path to the static files
      serveRoot: '/uploads', // URL path where the files will be accessible
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
  ],
  controllers: [AppController, WebhookController],
  providers: [MailerService, AppService, PrismaService],
  exports: [MailerService],
})
export class AppModule {}
