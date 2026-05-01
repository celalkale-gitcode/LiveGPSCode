import { Module } from '@nestjs/common';
import { MapGateway } from './map.gateway';
import { PrismaService } from '../common/prisma.service';

@Module({
  providers: [MapGateway, PrismaService],
})
export class MapModule {}

