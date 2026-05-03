import { useState, useEffect, useRef } from 'react';

export const useGPS = (myId, socket) => {
  const [position, setPosition] = useState(null);
  const [isGpsActive, setIsGpsActive] = useState(false);
  const lastSignalTime = useRef(0);
  const watchIdRef = useRef(null);

  const startTracking = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        lastSignalTime.current = Date.now();
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
        setIsGpsActive(false);
        setPosition(null);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    startTracking();

    // 🕵️ AGRESİF DENETİM DÖNGÜSÜ
    const interval = setInterval(() => {
      const now = Date.now();
      
      // Sinyal 6 saniyedir donduysa veya gelmiyorsa ikonu SİL (Real-time Tepki)
      if (isGpsActive && (now - lastSignalTime.current > 6000)) {
        setIsGpsActive(false);
        setPosition(null);
      }

      // GPS pasifse (yukarıdan kapatılıp açıldıysa) uyandırmayı dene
      if (!isGpsActive) {
        startTracking();
      }
    }, 3000);

    return () => {
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myId]); // isGpsActive bağımlılığını sonsuz döngü olmaması için kaldırdık

  return { position, isGpsActive };
};
