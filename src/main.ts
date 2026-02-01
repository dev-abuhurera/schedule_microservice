import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import 'dotenv/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {

  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder().setTitle('Schedular Microservice').setDescription('Api for job scheduling').setVersion('1.0').build();
  const document = SwaggerModule.createDocument(app, config);

  app.useGlobalPipes(new ValidationPipe({

    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,

  }));

  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
  console.log('Server running on http://localhost:3000');
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Loaded ' : 'NOT LOADED ');
}

bootstrap();
