import { useState, useEffect, useCallback, useRef } from 'react';

export const useGPS = (myId, socket) => {
  const [position, setPosition] = useState(null);
  const [isGpsActive, setIsGpsActive] = useState(false);
  const lastSuccessTime = useRef(Date.now());
  const isQuerying = useRef(false);

  // 🛡️ 1. GÜVENLİK: İzin durumunu direkt tarayıcı ayarlarından sorgula
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
    } catch (e) {
      console.warn("Permission API desteklenmiyor");
    }
    return true;
  }, []);

  const checkLocation = useCallback(async () => {
    const hasPermission = await checkPermissions();
    if (!hasPermission) return;

    // 🔒 Çakışma Kilidi: Sorgu devam ediyorsa yenisini başlatma
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
        // Hata durumunda (Konum kapandıysa) beklemeden pasife çek
        setIsGpsActive(false);
        setPosition(null);
        isQuerying.current = false;
      },
      { 
        enableHighAccuracy: true, 
        timeout: 6000, 
        maximumAge: 0  
      }
    );
  }, [myId, socket, checkPermissions]);

  useEffect(() => {
    checkLocation();
    const queryInterval = setInterval(() => {
      if (!isQuerying.current) checkLocation();
    }, 4000);

    // 🕵️ HEARTBEAT: Sinyal gecikirse kontrol
    const heartbeatInterval = setInterval(() => {
      if (Date.now() - lastSuccessTime.current > 10000) {
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

  // checkPermissions fonksiyonunu LiveMap.jsx'in kullanabilmesi için return ediyoruz
  return { position, isGpsActive, checkPermissions };
};
