import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { io } from 'socket.io-client';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// İkonların düzgün görünmesi için bu bloğu ekleyin
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cloudflare.com',
  iconUrl: 'https://cloudflare.com',
  shadowUrl: 'https://cloudflare.com',
});

const socket = io("https://livegps-location.onrender.com/"); // Kendi linkini yaz

export default function LiveMap() {
  const [locations, setLocations] = useState({});
  const [myId] = useState("User_" + Math.floor(Math.random() * 1000));

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
      (err) => console.error(err),
      { enableHighAccuracy: true, distanceFilter: 5 }
    );

    // 2. SOKETTEN GELEN VERİLER
    socket.on('konumAl', (data) => {
      setLocations(prev => ({ ...prev, [data.id]: [data.lat, data.lng] }));
    });

    return () => {
      navigator.geolocation.clearWatch(watchId);
      socket.off('konumAl');
    };
  }, [myId]);

  return (
    <MapContainer center={[41.0082, 28.9784]} zoom={13} style={{ height: "100vh" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {Object.entries(locations).map(([id, pos]) => (
        <Marker key={id} position={pos}>
          <Popup>{id === myId ? "Siz" : `Cihaz: ${id}`}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

