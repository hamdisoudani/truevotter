import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const frontendUrls = process.env.FRONTEND_URL 
    ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
    : ['http://localhost:5173'];

  app.enableCors({
    origin: [
      ...frontendUrls,
      'https://www.reddit.com',
      'https://old.reddit.com',
      'chrome-extension://*',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT ?? 8000);
  console.log(
    `Application is running on: http://localhost:${process.env.PORT ?? 8000}`,
  );
}
bootstrap();
