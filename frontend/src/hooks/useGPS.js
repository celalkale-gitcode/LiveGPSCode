import { useState, useEffect, useRef } from 'react';

export const useGPS = (myId, socket) => {
  const [position, setPosition] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const lastSignal = useRef(0);
  const watchId = useRef(null);

  const start = () => {
    if (watchId.current) navigator.geolocation.clearWatch(watchId.current);

    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setPosition(coords);
        setIsActive(true);
        lastSignal.current = Date.now();
        
        // Soket üzerinden backend'e bas
        if (socket) {
          socket.emit('konumGonder', { id: myId, lat: coords[0], lng: coords[1] });
        }
      },
      () => {
        setIsActive(false);
        setPosition(null);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    start();
    
    // Heartbeat: 4 saniyede bir "Hayatta mısın?" kontrolü
    const timer = setInterval(() => {
      if (Date.now() - lastSignal.current > 6000) {
        setIsActive(false);
        setPosition(null);
        start(); // Sinyal öldüyse tekrar canlandırmayı dene
      }
    }, 4000);

    return () => {
      navigator.geolocation.clearWatch(watchId.current);
      clearInterval(timer);
    };
  }, [myId]);

  return { position, isActive };
};

