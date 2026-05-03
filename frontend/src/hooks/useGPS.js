import { useState, useEffect, useCallback, useRef } from 'react';

export const useGPS = (myId, socket) => {
  const [position, setPosition] = useState(null);
  const [isGpsActive, setIsGpsActive] = useState(false);
  const lastSuccessTime = useRef(Date.now());
  const isQuerying = useRef(false); // 🔒 Çakışmayı önleyen kilit

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
    } catch (e) { console.warn("Permission API desteklenmiyor"); }
    return true;
  }, []);

  const checkLocation = useCallback(async () => {
    const hasPermission = await checkPermissions();
    if (!hasPermission) return;

    // 🛑 Eğer bir sorgu zaten devam ediyorsa (uydudan yanıt bekleniyorsa) yenisini başlatma
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
        isQuerying.current = false; // İşlem bitti, kilidi aç
      },
      () => {
        // Hata durumunda sadece kilidi aç, pasife çekme kararını Heartbeat döngüsüne bırak
        isQuerying.current = false;
      },
      { 
        enableHighAccuracy: true, 
        timeout: 10000, // ⏳ Sinyal bulmak için tarayıcıya 10 saniye tanı (Yanıp sönmeyi engeller)
        maximumAge: 0  
      }
    );
  }, [myId, socket, checkPermissions]);

  useEffect(() => {
    checkLocation();
    
    // Her 5 saniyede bir, eğer önceki işlem bittiyse yeni sorgu yap
    const queryInterval = setInterval(() => {
      if (!isQuerying.current) checkLocation();
    }, 5000);

    // 🕵️ HEARTBEAT: Sinyal anlık kopsa bile butonu hemen kapatma. 
    // 15 saniye boyunca HİÇ taze veri gelmezse ancak o zaman pasife çek.
    const heartbeatInterval = setInterval(() => {
      if (Date.now() - lastSuccessTime.current > 15000) {
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

  return { position, isGpsActive, checkPermissions };
};
