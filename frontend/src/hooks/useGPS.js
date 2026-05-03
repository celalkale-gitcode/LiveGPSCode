import { useState, useEffect, useRef } from 'react';

export const useGPS = (myId, socket) => {
  const [position, setPosition] = useState(null);
  const [isGpsActive, setIsGpsActive] = useState(false);
  const lastSignalTime = useRef(0);
  const watchId = useRef(null);

  const startTracking = () => {
    if (watchId.current) navigator.geolocation.clearWatch(watchId.current);

    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        lastSignalTime.current = Date.now();
        setIsGpsActive(true);
        setPosition(coords);
        
        // Backend'e canlı gönderim
        if (socket) {
          socket.emit('konumGonder', { id: myId, lat: coords[0], lng: coords[1] });
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

    // 🕵️ Heartbeat Döngüsü: Google Haritalar gibi ikonun silinmesini kontrol eder
    const interval = setInterval(() => {
      const now = Date.now();
      // 6 saniyedir taze sinyal yoksa "ölü" say ve her şeyi temizle
      if (isGpsActive && (now - lastSignalTime.current > 6000)) {
        setIsGpsActive(false);
        setPosition(null);
      }

      // GPS kapalıysa (veya yeni koptuysa) sistemi uyandırmayı dene
      if (!isGpsActive) {
        startTracking();
      }
    }, 3000);

    return () => {
      if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
      clearInterval(interval);
    };
  }, [myId, isGpsActive]);

  return { position, isGpsActive };
};
