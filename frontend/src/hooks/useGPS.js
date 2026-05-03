import { useState, useEffect, useCallback } from 'react';

export const useGPS = (myId, socket) => {
  const [position, setPosition] = useState(null);
  const [isGpsActive, setIsGpsActive] = useState(false);

  // 🚀 ANA SORGULAMA FONKSİYONU
  const checkLocation = useCallback(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setIsGpsActive(true);
        setPosition(coords);
        
        // Backend'e canlı soket yayını
        if (socket) {
          socket.emit('konumGonder', { 
            id: myId, 
            lat: pos.coords.latitude, 
            lng: pos.coords.longitude 
          });
        }
      },
      () => {
        // 🛑 KONUM KAPALI: Bilgileri anında temizle
        setIsGpsActive(false);
        setPosition(null);
      },
      { 
        enableHighAccuracy: true, 
        timeout: 4000, // 4 saniye içinde cevap gelmezse kapalı say
        maximumAge: 0  // Her zaman en taze veriyi zorla
      }
    );
  }, [myId, socket]);

  useEffect(() => {
    // İlk açılışta hemen kontrol et
    checkLocation();

    // 🔄 REAL-TIME DÖNGÜ: Her 3 saniyede bir konumu zorla sorgula
    const interval = setInterval(checkLocation, 3000);

    return () => clearInterval(interval);
  }, [checkLocation]);

  return { position, isGpsActive };
};
