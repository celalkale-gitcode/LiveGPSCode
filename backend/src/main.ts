import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // Frontend'den gelen istekleri engellememesi için
  await app.listen(process.env.PORT || 3000);
  console.log(`Uygulama port ${process.env.PORT || 3000} üzerinde çalışıyor`);
}
bootstrap();

