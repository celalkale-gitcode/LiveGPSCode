import { useState, useEffect, useCallback } from 'react';

export const useGPS = (myId, socket) => {
  const [position, setPosition] = useState(null);
  const [isGpsActive, setIsGpsActive] = useState(false);

  // 🚀 ANA MOTOR: Tekil bir sorgu yapar ve durumu netleştirir
  const askLocation = useCallback(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setIsGpsActive(true);
        setPosition(coords);
        
        if (socket) {
          socket.emit('konumGonder', { 
            id: myId, 
            lat: pos.coords.latitude, 
            lng: pos.coords.longitude 
          });
        }
      },
      () => {
        // 🛑 Konum kapalıysa veya hata verirse her şeyi anında sıfırla
        setIsGpsActive(false);
        setPosition(null);
      },
      { 
        enableHighAccuracy: true, 
        timeout: 4000, // 4 saniye içinde cevap gelmezse GPS'i ölü say
        maximumAge: 0   // Asla eski veriyi kabul etme
      }
    );
  }, [myId, socket]);

  useEffect(() => {
    // İlk açılışta hemen kontrol et
    askLocation();

    // 🔄 REAL-TIME DÖNGÜ: Her 3 saniyede bir durumu zorla güncelle
    const interval = setInterval(askLocation, 3000);

    return () => clearInterval(interval);
  }, [askLocation]);

  return { position, isGpsActive };
};
