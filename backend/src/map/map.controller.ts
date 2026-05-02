import { Controller, Get, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { MapService } from './map.service';

@Controller('map') 
export class MapController {
  constructor(private readonly mapService: MapService) {}

  /**
   * Veritabanındaki (Supabase) son 100 konumu listeler
   * GET https://onrender.com
   */
  @Get('history')
  async getHistory() {
    return this.mapService.getPastLocations();
  }

  /**
   * Frontend'deki "Konumu Kaydet" butonuna basıldığında veriyi DB'ye yazar
   * POST https://onrender.com
   */
  @Post('save')
  @HttpCode(HttpStatus.CREATED) // Başarılı kayıtta 201 kodu döner
  async saveLocation(@Body() data: { id: string; lat: number; lng: number }) {
    console.log(`📍 Kayıt isteği geldi: Cihaz ${data.id} -> Lat: ${data.lat}, Lng: ${data.lng}`);
    
    // MapService üzerinden Prisma aracılığıyla Supabase'e yazar
    return this.mapService.saveLocation(data);
  }
}

