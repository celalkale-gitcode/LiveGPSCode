import { useState, useEffect, useCallback, useRef } from 'react';

export const useGPS = (myId, socket) => {
  const [position, setPosition] = useState(null);
  const [isGpsActive, setIsGpsActive] = useState(false);
  const lastSuccessTime = useRef(Date.now());
  const isQuerying = useRef(false); // 🔒 Çakışma kilidi

  const checkLocation = useCallback(() => {
    if (isQuerying.current) return;
    isQuerying.current = true;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        lastSuccessTime.current = Date.now(); // ✅ Sinyal başarılı
        
        setIsGpsActive(true);
        setPosition(coords);
        
        if (socket) {
          socket.emit('konumGonder', { 
            id: myId, 
            lat: pos.coords.latitude, 
            lng: pos.coords.longitude 
          });
        }
        isQuerying.current = false;
      },
      () => {
        // Hata gelse bile hemen kapatma, alttaki heartbeat döngüsünü bekle
        isQuerying.current = false;
      },
      { 
        enableHighAccuracy: true, 
        timeout: 10000, // 10 saniye sabırla bekle
        maximumAge: 0  
      }
    );
  }, [myId, socket]);

  useEffect(() => {
    checkLocation();
    const queryInterval = setInterval(checkLocation, 4000);

    // 🕵️ HEARTBEAT: Eğer 12 saniyedir tek bir taze veri bile gelmediyse pasife çek
    // Bu, butonun "aktif-pasif" diye yanıp sönmesini engeller.
    const heartbeatInterval = setInterval(() => {
      if (Date.now() - lastSuccessTime.current > 12000) {
        setIsGpsActive(false);
        setPosition(null);
      }
    }, 3000);

    return () => {
      clearInterval(queryInterval);
      clearInterval(heartbeatInterval);
      isQuerying.current = false;
    };
  }, [checkLocation]);

  return { position, isGpsActive };
};
