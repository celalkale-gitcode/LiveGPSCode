import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { io } from 'socket.io-client';
import 'leaflet/dist/leaflet.css';

// 🚀 KESİN ÇÖZÜM: İkonu kodun içine gömüyoruz
const heartIcon = new L.Icon({
  iconUrl: 'https://githubusercontent.com',
  shadowUrl: 'https://cloudflare.com',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Render backend URL'niz
const socket = io("https://onrender.com");

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
          <Marker key={id} position={position} icon={heartIcon}>
            <Popup>{id === myId ? "Siz" : `Cihaz: ${id}`}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
