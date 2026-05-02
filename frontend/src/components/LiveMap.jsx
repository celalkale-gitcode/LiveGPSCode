import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { io } from 'socket.io-client';
import 'leaflet/dist/leaflet.css';

// ... (importlar aynı)

// 🚀 EN GARANTİ YÖNTEM: İkonu SVG kodu olarak tanımlıyoruz
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

  useEffect(() => {
    // 1. GPS TAKİBİ
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
    <div style={{ height: "100vh", width: "100%" }}>
      <MapContainer center={[41.0082, 28.9784]} zoom={13} style={{ height: "100%", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        
        {Object.entries(locations).map(([id, position]) => (
          // Harita içindeki Marker kullanımı:
         <Marker key={id} position={position} icon={customSVGIcon}>
           <Popup>{id === myId ? "Siz" : `Cihaz: ${id}`}</Popup>
         </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
