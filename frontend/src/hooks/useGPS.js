import { useState, useEffect, useCallback, useRef } from 'react';

export const useGPS = (myId, socket) => {
  const [position, setPosition] = useState(null);
  const [isGpsActive, setIsGpsActive] = useState(false);
  const lastSuccessTime = useRef(Date.now());
  const isQuerying = useRef(false);

  // 🛡️ İzin durumunu direkt tarayıcı ayarlarından sorgula (En Hızlı Yöntem)
  const checkPermissions = useCallback(async () => {
    try {
      if (navigator.permissions && navigator.permissions.query) {
        const result = await navigator.permissions.query({ name: 'geolocation' });
        // Kullanıcı konumu kapattıysa beklemeden her şeyi pasif yap
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

    if (isQuerying.current) return;
    isQuerying.current = true;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        lastSuccessTime.current = Date.now();
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
        // Hata durumunda (Konum kapandıysa) uyduyu beklemeden kapat
        setIsGpsActive(false);
        setPosition(null);
        isQuerying.current = false;
      },
      { 
        enableHighAccuracy: true, 
        timeout: 4000, // Sorgu süresini kısalttık ki tepki hızı artsın
        maximumAge: 0  
      }
    );
  }, [myId, socket, checkPermissions]);

  useEffect(() => {
    checkLocation();
    const queryInterval = setInterval(checkLocation, 3500);

    // 🕵️ HEARTBEAT: Sinyal gecikirse (timeout beklemeden) kontrol eder
    const heartbeatInterval = setInterval(() => {
      if (Date.now() - lastSuccessTime.current > 7000) {
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

