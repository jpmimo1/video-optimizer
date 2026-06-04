import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const processType = process.env.PROCESS_TYPE || 'API';

  if (processType === 'WORKER') {
    console.log('🚀 Starting container in WORKER mode (No HTTP server)...');

    // createApplicationContext initializes NestJS without opening HTTP ports.
    // It only loads services, the database, and Redis connections.
    await NestFactory.createApplicationContext(AppModule);

    // As a background process, we omit app.listen().
    // The container will stay alive processing BullMQ jobs.
  } else {
    console.log('🚀 Starting container in API mode (Web Server)...');

    const app = await NestFactory.create(AppModule);

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    app.enableCors({
      origin: frontendUrl,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
    });

    app.useGlobalPipes(new ValidationPipe());

    await app.listen(4000);
    console.log('✅ API listening on http://localhost:4000');
  }
}
bootstrap();
