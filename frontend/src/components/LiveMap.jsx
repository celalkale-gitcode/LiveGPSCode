import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { io } from 'socket.io-client';
import LocationList from './LocationList'; // 👈 Yeni komponenti ekledik
import 'leaflet/dist/leaflet.css';

// ... (customSVGIcon tanımı aynı kalsın)

const BACKEND_URL = "https://onrender.com";
const socket = io(BACKEND_URL);

export default function LiveMap() {
  const [locations, setLocations] = useState({});
  const [myId] = useState("Cihaz_" + Math.random().toString(36).substr(2, 4));
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Veritabanından geçmişi çeken fonksiyon
  const fetchHistory = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/map/history`);
      const data = await res.json();
      setHistory(data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchHistory();
    // GPS ve Socket işlemleri aynı kalıyor...
    const watchId = navigator.geolocation.watchPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      socket.emit('konumGonder', { id: myId, lat: latitude, lng: longitude });
      setLocations(prev => ({ ...prev, [myId]: [latitude, longitude] }));
      setLoading(false);
    }, null, { enableHighAccuracy: true });

    socket.on('konumAl', (data) => {
      setLocations(prev => ({ ...prev, [data.id]: [data.lat, data.lng] }));
    });

    return () => navigator.geolocation.clearWatch(watchId);
  }, [myId]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* ÜST KISIM: HARİTA (%60 boy) */}
      <div style={{ height: '60%', width: '100%', position: 'relative' }}>
        <MapContainer center={[41.0082, 28.9784]} zoom={13} style={{ height: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {Object.entries(locations).map(([id, pos]) => (
            <Marker key={id} position={pos} icon={customSVGIcon}>
              <Popup>
                <strong>{id === myId ? "Siz" : id}</strong> <br />
                📍 {pos[0].toFixed(5)}, {pos[1].toFixed(5)}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
        
        {/* Kaydet butonu harita üzerinde kalsın */}
        <button 
          onClick={async () => {
             // ... (saveCurrentLocation içeriği buraya gelecek, fetchHistory() sonunda çağrılacak)
          }} 
          style={{ position: 'absolute', bottom: '20px', right: '20px', zIndex: 1000, padding: '12px 20px', backgroundColor: '#3B82F6', color: 'white', border: 'none', borderRadius: '50px', cursor: 'pointer', fontWeight: 'bold' }}>
          📍 Konumu Kaydet
        </button>
      </div>

      {/* ALT KISIM: LİSTE KOMPONENTİ (%40 boy) */}
      <div style={{ height: '40%', width: '100%' }}>
        <LocationList history={history} />
      </div>
    </div>
  );
}



