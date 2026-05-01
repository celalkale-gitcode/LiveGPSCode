import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class MapService {
  constructor(private prisma: PrismaService) {}

  // Canlı gelen konumu veritabanına (Supabase) kalıcı olarak kaydetmek için
  async saveLocation(data: { id: string; lat: number; lng: number }) {
    return this.prisma.stokHareketleri.create({
      data: {
        tip: 'CANLI_TAKIP',
        latitude: data.lat,
        longitude: data.lng,
        tarih: new Date(),
        // Not: Şemanızda 'id' varsa buraya 'urun_id' gibi bir eşleştirme yapabilirsiniz
      },
    });
  }

  // Harita ilk açıldığında son konumları veritabanından çekmek için
  async getPastLocations() {
    return this.prisma.stokHareketleri.findMany({
      take: 100, // Son 100 hareketi getir
      orderBy: { tarih: 'desc' },
      where: {
        latitude: { not: null },
        longitude: { not: null },
      },
    });
  }
}

