import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Set API Prefix and exclude root health check endpoints for container pings
  app.setGlobalPrefix('api', { exclude: ['/', 'health'] });

  // Enable CORS
  app.enableCors({
    origin: '*', // Allow all in local dev, restrict in production
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global validation pipeline
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Setup Swagger Open API Docs
  const config = new DocumentBuilder()
    .setTitle('PhiloMind AI Learning API')
    .setDescription('Immersive AI philosophy learning endpoints including debate, podcasts, and spaced repetition flashcards.')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`[PhiloMind Backend] Service is running on http://localhost:${port}/api`);
  console.log(`[PhiloMind Swagger] Documentation is running on http://localhost:${port}/docs`);
}
bootstrap();
