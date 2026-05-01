import { Controller, Get, Post, Body } from '@nestjs/common';
import { MapService } from './map.service';

@Controller('map') // Tarayıcıda ://erp-projen.com adresine karşılık gelir
export class MapController {
  constructor(private readonly mapService: MapService) {}

  // Veritabanındaki (Supabase) son 100 konumu getirir
  // GET https://onrender.com
  @Get('history')
  async getHistory() {
    return this.mapService.getPastLocations();
  }

  // Manuel olarak konum eklemek istersen (Örn: Postman ile test için)
  // POST https://onrender.com
  @Post('save')
  async saveLocation(@Body() data: { id: string; lat: number; lng: number }) {
    return this.mapService.saveLocation(data);
  }
}

