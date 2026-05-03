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

    const interval = setInterval(() => {
      const now = Date.now();
      if (isGpsActive && (now - lastSignalTime.current > 6000)) {
        setIsGpsActive(false);
        setPosition(null);
      }

      if (!isGpsActive) {
        startTracking();
      }
    }, 3000);

    return () => {
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
      clearInterval(interval);
    };
    // eslint-disable-next-line
  }, [myId]); 

  return { position, isGpsActive };
};
