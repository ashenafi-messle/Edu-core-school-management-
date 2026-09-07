import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';

// Load environmental parameters
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configure CORS allowing client web-apps to make queries and supply the 'X-School-ID' context header
  app.enableCors({
    origin: '*', // Set to specific frontend domain in strict production environments
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization, X-School-ID',
    credentials: true,
  });

  // Set standard API route prefix
  app.setGlobalPrefix('api');

  // Register validation pipeline globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    })
  );

  const port = process.env.BACKEND_PORT || 4000;
  await app.listen(port, '0.0.0.0');
  console.log(`[EduCore] Standalone NestJS Multi-Tenant API running on http://0.0.0.0:${port}`);
}

bootstrap();
