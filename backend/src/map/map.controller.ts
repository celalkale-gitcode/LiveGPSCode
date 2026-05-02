import { Controller, Get, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { MapService } from './map.service';

@Controller('map') 
export class MapController {
  constructor(private readonly mapService: MapService) {}

  /**
   * LocationList komponenti için veritabanındaki (Supabase) son kayıtları çeker
   * GET https://onrender.com
   */
  @Get('history')
  async getHistory() {
    // Service içindeki güncel getPastLocations metodunu çağırır
    return this.mapService.getPastLocations();
  }

  /**
   * Frontend'deki "Konumu Kaydet" butonuna basıldığında veriyi DB'ye yazar
   * POST https://onrender.com
   */
  @Post('save')
  @HttpCode(HttpStatus.CREATED) // Başarılı kayıtta 201 (Created) döner, React bunu "response.ok" olarak yakalar
  async saveLocation(@Body() data: { id: string; lat: number; lng: number }) {
    // Render loglarında ne olup bittiğini görmek için takip satırı
    console.log(`💾 Yeni Kayıt: Cihaz: ${data.id} | Konum: ${data.lat}, ${data.lng}`);
    
    // Veriyi kalıcı olarak kaydeder
    return this.mapService.saveLocation(data);
  }
}


