import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import db from './database/initializeDatabase';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  db;
  app.enableCors();
  await app.listen(4000);
}
bootstrap();
