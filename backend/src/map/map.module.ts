import { Module } from '@nestjs/common';
import { MapGateway } from './map.gateway';
import { MapService } from './map.service';
import { MapController } from './map.controller'; // 👈 Eklendi
import { PrismaService } from '../common/prisma.service';

@Module({
  controllers: [MapController], // 👈 Eklendi
  providers: [MapGateway, MapService, PrismaService],
})
export class MapModule {}


