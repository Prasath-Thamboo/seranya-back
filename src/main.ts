import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger, ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // Désactiver le bodyParser JSON pour les webhooks Stripe
  app.use('/webhook/stripe', bodyParser.raw({ type: 'application/json' }));

  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter());
  // Allow larger file uploads by increasing the body size limit
  // Adjust body parser limits
  app.use(bodyParser.json({ limit: '50mb' })); // Increase the limit as needed (e.g., 50mb)
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

  app.enableCors({
    origin: '*', // Allowing all origins
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  });

  // Servir les fichiers statiques
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads',
  });

  const config = new DocumentBuilder()
    .setTitle('Blog API')
    .setDescription('API documentation for the Blog application')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(5000);
  Logger.log('Application is running on: ' + (await app.getUrl()));
}

bootstrap();
