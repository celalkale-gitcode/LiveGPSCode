import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { io } from 'socket.io-client';
import 'leaflet/dist/leaflet.css';

// 🚀 İkonu SVG kodu olarak tanımlıyoruz
const customSVGIcon = L.divIcon({
  html: `
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://w3.org">
      <path d="M12 21C16 17.5 19 14.4087 19 11.2C19 7.22355 15.866 4 12 4C8.13401 4 5 7.22355 5 11.2C5 14.4087 8 17.5 12 21Z" fill="#3B82F6" stroke="white" stroke-width="2"/>
      <circle cx="12" cy="11" r="3" fill="white"/>
    </svg>
  `,
  className: "custom-gps-icon",
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

// Render backend URL'niz
const socket = io("https://livegps-location.onrender.com/");

export default function LiveMap() {
  const [locations, setLocations] = useState({});
  const [myId] = useState("Cihaz_" + Math.random().toString(36).substr(2, 4));

  // 💾 MANUEL KAYIT FONKSİYONU
  const saveCurrentLocation = async () => {
    const myCurrentPos = locations[myId]; // State'den kendi güncel koordinatlarımızı alıyoruz

    if (!myCurrentPos) {
      alert("⚠️ Henüz konum verisi alınamadı, lütfen bekleyin.");
      return;
    }

    try {
      const response = await fetch("https://onrender.com", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: myId,
          lat: myCurrentPos[0], // Enlem (latitude)
          lng: myCurrentPos[1]  // Boylam (longitude)
        }),
      });

      if (response.ok) {
        alert("✅ Konum başarıyla Supabase'e kaydedildi!");
      } else {
        alert("❌ Kayıt sırasında sunucu hatası oluştu.");
      }
    } catch (error) {
      console.error("Kayıt Hatası:", error);
      alert("❌ Bağlantı hatası: Konum kaydedilemedi.");
    }
  };

  useEffect(() => {
    // 1. GPS TAKİBİ (Sadece Soket ile yayın yapar, DB'ye yazmaz)
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        socket.emit('konumGonder', {
          id: myId,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
      },
      (err) => console.error("GPS Hatası:", err),
      { enableHighAccuracy: true, distanceFilter: 2 }
    );

    // 2. SOKET DİNLEME
    socket.on('konumAl', (data) => {
      setLocations(prev => ({ ...prev, [data.id]: [data.lat, data.lng] }));
    });

    return () => {
      navigator.geolocation.clearWatch(watchId);
      socket.off('konumAl');
    };
  }, [myId]);

  return (
    <div style={{ height: "100vh", width: "100%", position: "relative" }}>
      {/* HARİTA */}
      <MapContainer center={[41.0082, 28.9784]} zoom={13} style={{ height: "100%", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        
        {Object.entries(locations).map(([id, position]) => (
         <Marker key={id} position={position} icon={customSVGIcon}>
           <Popup>{id === myId ? "Siz" : `Cihaz: ${id}`}</Popup>
         </Marker>
        ))}
      </MapContainer>

      {/* 📍 KAYDET BUTONU */}
      <button 
        onClick={saveCurrentLocation}
        style={{
          position: 'absolute',
          bottom: '30px',
          right: '20px',
          zIndex: 1000,
          padding: '12px 24px',
          backgroundColor: '#3B82F6',
          color: 'white',
          border: 'none',
          borderRadius: '50px',
          fontWeight: 'bold',
          fontSize: '14px',
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        <span>💾 Konumu Kaydet</span>
      </button>
    </div>
  );
}

