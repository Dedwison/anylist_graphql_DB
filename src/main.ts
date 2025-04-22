import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const logger = new Logger('Bootstrap');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      // forbidNonWhitelisted: true,
    })
  )

  app.enableCors();

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`App running on port: ${port}`);
}
bootstrap();
