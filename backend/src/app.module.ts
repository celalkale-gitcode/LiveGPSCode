import { Module } from '@nestjs/common';
import { MapModule } from './map/map.module';
import { PrismaService } from './common/prisma.service';

@Module({
  imports: [
    // Hazırladığımız harita ve soket modülünü buraya ekliyoruz
    MapModule,
  ],
  controllers: [
    // Genel uygulama kontrolcüleri buraya gelebilir (Health Check vb.)
  ],
  providers: [
    // PrismaService'i global düzeyde kullanmak istersen buraya ekleyebilirsin
    PrismaService,
  ],
})
export class AppModule {}

