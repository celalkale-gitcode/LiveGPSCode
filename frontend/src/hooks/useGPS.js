import { useState, useEffect, useCallback, useRef } from 'react';

export const useGPS = (myId, socket) => {
  const [position, setPosition] = useState(null);
  const [isGpsActive, setIsGpsActive] = useState(false);
  const isQuerying = useRef(false); // 🔒 Çakışmayı önleyen kilit mekanizması

  const checkLocation = useCallback(() => {
    // Eğer halihazırda bir sorgu yapılıyorsa (cevap bekleniyorsa) yenisini başlatma
    if (isQuerying.current) return;

    isQuerying.current = true; // Sorguyu kilitle

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
        isQuerying.current = false; // Kilidi aç (Başarılı)
      },
      () => {
        setIsGpsActive(false);
        setPosition(null);
        isQuerying.current = false; // Kilidi aç (Hata/Kapalı)
      },
      { 
        enableHighAccuracy: true, 
        timeout: 6000, // Sorgu süresini biraz uzatarak tarayıcıya nefes aldırdık
        maximumAge: 0  
      }
    );
  }, [myId, socket]);

  useEffect(() => {
    // İlk girişte sorgula
    checkLocation();

    // 🔄 REAL-TIME DÖNGÜ: Her 4 saniyede bir durumu kontrol et
    const interval = setInterval(checkLocation, 4000);

    return () => {
      clearInterval(interval);
      isQuerying.current = false;
    };
  }, [checkLocation]);

  return { position, isGpsActive };
};
