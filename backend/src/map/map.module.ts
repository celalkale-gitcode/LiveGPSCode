import { Module } from '@nestjs/common';
import { MapGateway } from './map.gateway';
import { MapService } from './map.service'; // Eklendi
import { PrismaService } from '../common/prisma.service';

@Module({
  providers: [MapGateway, MapService, PrismaService], // MapService eklendi
})
export class MapModule {}


