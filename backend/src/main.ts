import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Serve static files under /public/ for our uploads local bucket
  app.useStaticAssets(join(__dirname, '..', 'public'), {
    prefix: '/public/',
  });

  // Set API Prefix and exclude root health check endpoints for container pings
  app.setGlobalPrefix('api', { exclude: ['/', 'health'] });

  // Apply Helmet for security headers
  app.use(helmet({
    contentSecurityPolicy: false, // Ensure Swagger UI doesn't break
  }));

  // Enable CORS
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'];

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
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

  // Force port 7860 in Hugging Face Spaces environment to satisfy health check routing, otherwise fallback to PORT or 3001
  const port = process.env.SPACE_ID ? 7860 : (process.env.PORT || 3001);
  await app.listen(port, '0.0.0.0');
  console.log(`[PhiloMind Backend] Service is running on port ${port} (bind 0.0.0.0)`);
  console.log(`[PhiloMind Swagger] Documentation is available at http://localhost:${port}/docs`);
}
bootstrap();
