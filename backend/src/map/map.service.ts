import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class MapService {
  constructor(private prisma: PrismaService) {}

  /**
   * Manuel olarak butona basıldığında konumu kaydeder.
   */
  async saveLocation(data: { id: string; lat: number; lng: number }) {
    return this.prisma.stokHareketleri.create({
      data: {
        tip: 'MANUEL_KAYIT', // Artık sadece butona basınca kayıt yaptığımız için tipi güncelledik
        latitude: data.lat,
        longitude: data.lng,
        tarih: new Date(),
      },
    });
  }

  /**
   * Frontend'deki LocationList için kayıt geçmişini getirir.
   */
  async getPastLocations() {
    return this.prisma.stokHareketleri.findMany({
      take: 50, // Performans için son 50 kayıt yeterlidir
      orderBy: { 
        tarih: 'desc' // En yeni kayıt en üstte
      },
      select: {
        id: true,
        latitude: true,
        longitude: true,
        tarih: true,
        tip: true,
      },
    });
  }
}


