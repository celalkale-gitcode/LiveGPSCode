import { useState, useEffect, useCallback, useRef } from 'react';

export const useGPS = (myId, socket) => {
  const [position, setPosition] = useState(null);
  const [isGpsActive, setIsGpsActive] = useState(false);
  const lastSuccessTime = useRef(Date.now());
  const isQuerying = useRef(false);

  // 🛡️ İzin durumunu anlık sorgula (Sinyal beklemez, ayarlara bakar)
  const checkPermissions = useCallback(async () => {
    try {
      if (navigator.permissions && navigator.permissions.query) {
        const result = await navigator.permissions.query({ name: 'geolocation' });
        if (result.state === 'denied') {
          setIsGpsActive(false);
          setPosition(null);
          return false;
        }
      }
    } catch (e) { console.warn("Permission API yetersiz."); }
    return true;
  }, []);

  const checkLocation = useCallback(async () => {
    // Önce izne bak, kapalıysa sorgu bile atma, butonu anında düşür
    const hasPermission = await checkPermissions();
    if (!hasPermission) return;

    if (isQuerying.current) return;
    isQuerying.current = true;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        lastSuccessTime.current = Date.now();
        setIsGpsActive(true);
        setPosition(coords);
        
        if (socket) {
          socket.emit('konumGonder', { id: myId, lat: coords[0], lng: coords[1] });
        }
        isQuerying.current = false;
      },
      () => {
        // Hata geldiği an beklemeden kapat
        setIsGpsActive(false);
        setPosition(null);
        isQuerying.current = false;
      },
      { enableHighAccuracy: true, timeout: 3000, maximumAge: 0 } // Bekleme süresini 3sn'ye indirdik
    );
  }, [myId, socket, checkPermissions]);

  useEffect(() => {
    checkLocation();
    const queryInterval = setInterval(checkLocation, 3500);

    // 🕵️ Heartbeat süresini 12'den 6 saniyeye indirdik (Hayalet kaydı engeller)
    const heartbeatInterval = setInterval(() => {
      if (Date.now() - lastSuccessTime.current > 6000) {
        setIsGpsActive(false);
        setPosition(null);
      }
    }, 2000);

    return () => {
      clearInterval(queryInterval);
      clearInterval(heartbeatInterval);
      isQuerying.current = false;
    };
  }, [checkLocation]);

  return { position, isGpsActive };
};
