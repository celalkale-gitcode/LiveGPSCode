import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { io } from 'socket.io-client';
import Swal from 'sweetalert2'; 
import 'leaflet/dist/leaflet.css';

import LocationList from './LocationList';
import Loader from './Loader';
import { useGPS } from '../hooks/useGPS';

const customSVGIcon = L.divIcon({
  html: `<svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://w3.org"><path d="M12 21C16 17.5 19 14.4087 19 11.2C19 7.22355 15.866 4 12 4C8.13401 4 5 7.22355 5 11.2C5 14.4087 8 17.5 12 21Z" fill="#3B82F6" stroke="white" stroke-width="2"/><circle cx="12" cy="11" r="3" fill="white"/></svg>`,
  className: "custom-gps-icon",
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

const BACKEND_URL = "https://livegps-location.onrender.com";
const socket = io(BACKEND_URL);

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 2000,
});

function RecenterMap({ coords }) {
  const map = useMap();
  useEffect(() => { 
    if (coords) map.flyTo(coords, 16); 
  }, [coords, map]);
  return null;
}

export default function LiveMap() {
  const [myId] = useState("Cihaz_" + Math.random().toString(36).substr(2, 4));
  const [locations, setLocations] = useState({});
  const [history, setHistory] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [appReady, setAppReady] = useState(false);

  // 🛰️ checkPermissions fonksiyonunu modülden aldık
  const { position, isGpsActive, checkPermissions } = useGPS(myId, socket);

  const fetchHistory = async () => {
    setListLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/map/history`);
      const data = await res.json();
      setHistory(data);
    } catch (err) { console.error(err); } 
    finally { setListLoading(false); }
  };

  useEffect(() => {
    fetchHistory();
    const timer = setTimeout(() => setAppReady(true), 3000);
    socket.on('konumAl', (data) => {
      setLocations(prev => ({ ...prev, [data.id]: [data.lat, data.lng] }));
    });
    return () => {
      socket.off('konumAl');
      clearTimeout(timer);
    };
  }, []);

  const saveCurrentLocation = async () => {
    // 🛡️ 2. GÜVENLİK: Butona basıldığı AN izinleri ve sinyali tekrar kontrol et
    const hasPermission = await checkPermissions();

    if (!hasPermission || !isGpsActive || !position) {
      Swal.fire({
        icon: 'error',
        title: 'Kayıt Yapılamadı',
        text: 'Konum servisleriniz kapalı görünüyor. Lütfen açıp tekrar deneyin.',
        confirmButtonColor: '#3B82F6'
      });
      return; // 🛑 Milisaniyelik koruma: Fetch asla başlatılmaz.
    }

    try {
      const response = await fetch(`${BACKEND_URL}/map/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          id: myId, 
          lat: position[0], 
          lng: position[1] 
        }),
      });
      if (response.ok) {
        Toast.fire({ icon: 'success', title: 'Konum kaydedildi!' });
        fetchHistory(); 
      }
    } catch (error) { console.error("Hata"); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100%' }}>
      {!appReady && <Loader message="Sistem Hazırlanıyor..." fullScreen={true} />}

      <div style={{ height: '60%', width: '100%', position: 'relative' }}>
        <MapContainer center={[41.0082, 28.9784]} zoom={13} style={{ height: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          
          {position && isGpsActive && <RecenterMap coords={position} />}
          
          {isGpsActive && position && (
            <Marker position={position} icon={customSVGIcon}>
              <Popup><strong>Siz</strong> <br /> {position[0].toFixed(5)}, {position[1].toFixed(5)}</Popup>
            </Marker>
          )}

          {Object.entries(locations).map(([id, pos]) => (
            id !== myId && <Marker key={id} position={pos} icon={customSVGIcon} />
          ))}
        </MapContainer>
        
        <button 
          onClick={saveCurrentLocation} 
          disabled={!isGpsActive}
          style={{ 
            position: 'absolute', bottom: '20px', right: '20px', zIndex: 1000, 
            padding: '14px 24px', 
            backgroundColor: isGpsActive ? '#3B82F6' : '#6b7280', 
            color: 'white', border: 'none', borderRadius: '50px', 
            cursor: isGpsActive ? 'pointer' : 'not-allowed', 
            fontWeight: 'bold', boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
            transition: 'all 0.3s ease',
            opacity: isGpsActive ? 1 : 0.7
          }}>
          {isGpsActive ? '💾 Konumu Kaydet' : '❌ Sinyal Bekleniyor...'}
        </button>
      </div>

      <div style={{ height: '40%', width: '100%' }}>
        <LocationList history={history} listLoading={listLoading} />
      </div>
    </div>
  );
}
