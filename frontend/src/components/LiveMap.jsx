import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { io } from 'socket.io-client';
import Swal from 'sweetalert2'; // 👈 SweetAlert2 İçe aktarıldı
import 'leaflet/dist/leaflet.css';

// Komponentlerimizi içe aktarıyoruz
import LocationList from './LocationList';
import Loader from './Loader';

// 🚀 İkon SVG Tanımı
const customSVGIcon = L.divIcon({
  html: `<svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://w3.org"><path d="M12 21C16 17.5 19 14.4087 19 11.2C19 7.22355 15.866 4 12 4C8.13401 4 5 7.22355 5 11.2C5 14.4087 8 17.5 12 21Z" fill="#3B82F6" stroke="white" stroke-width="2"/><circle cx="12" cy="11" r="3" fill="white"/></svg>`,
  className: "custom-gps-icon",
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

const BACKEND_URL = "https://livegps-location.onrender.com";
const socket = io(BACKEND_URL);

// Profesyonel Bildirim Ayarı (Toast)
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
});

function RecenterMap({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) map.flyTo(coords, 16);
  }, [coords, map]);
  return null;
}

export default function LiveMap() {
  const [locations, setLocations] = useState({});
  const [myId] = useState("Cihaz_" + Math.random().toString(36).substr(2, 4));
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listLoading, setListLoading] = useState(true);
  const [myFirstCoords, setMyFirstCoords] = useState(null);

  const fetchHistory = async () => {
    setListLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/map/history`);
      const data = await res.json();
      setHistory(data);
    } catch (err) { 
      console.error("Geçmiş çekilemedi:", err); 
    } finally {
      setListLoading(false);
    }
  };

  const saveCurrentLocation = async () => {
    const myCurrentPos = locations[myId]; 
    if (!myCurrentPos) {
      Toast.fire({ icon: 'warning', title: 'Konum henüz alınamadı!' });
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/map/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: myId,
          lat: myCurrentPos[0],
          lng: myCurrentPos[1]
        }),
      });

      if (response.ok) {
        Toast.fire({ icon: 'success', title: 'Konum kaydedildi!' }); // 👈 Profesyonel başarı mesajı
        fetchHistory();
      } else {
        Swal.fire({ icon: 'error', title: 'Hata!', text: 'Kayıt başarısız oldu.' });
      }
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Bağlantı Hatası', text: 'Sunucuya ulaşılamıyor.' });
    }
  };

  useEffect(() => {
    fetchHistory();
    const watchId = navigator.geolocation.watchPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      socket.emit('konumGonder', { id: myId, lat: latitude, lng: longitude });
      setLocations(prev => ({ ...prev, [myId]: [latitude, longitude] }));
      if (loading) {
        setMyFirstCoords([latitude, longitude]);
        setLoading(false);
      }
    }, (err) => {
      setLoading(false);
      Toast.fire({ icon: 'error', title: 'GPS izni verilmedi!' });
    }, { enableHighAccuracy: true });

    socket.on('konumAl', (data) => {
      setLocations(prev => ({ ...prev, [data.id]: [data.lat, data.lng] }));
    });

    return () => {
      navigator.geolocation.clearWatch(watchId);
      socket.off('konumAl');
    };
  }, [myId, loading]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100%' }}>
      {loading && <Loader message="GPS Bekleniyor..." fullScreen={true} />}

      <div style={{ height: '60%', width: '100%', position: 'relative' }}>
        <MapContainer center={[41.0082, 28.9784]} zoom={13} style={{ height: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {myFirstCoords && <RecenterMap coords={myFirstCoords} />}
          {Object.entries(locations).map(([id, pos]) => (
            <Marker key={id} position={pos} icon={customSVGIcon}>
              <Popup>
                <strong>{id === myId ? "Siz" : id}</strong> <br />
                📍 {pos[0].toFixed(5)}, {pos[1].toFixed(5)}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
        
        <button 
          onClick={saveCurrentLocation} 
          style={{ 
            position: 'absolute', bottom: '20px', right: '20px', zIndex: 1000, 
            padding: '14px 24px', backgroundColor: '#3B82F6', color: 'white', 
            border: 'none', borderRadius: '50px', cursor: 'pointer', 
            fontWeight: 'bold', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' 
          }}>
          💾 Konumu Kaydet
        </button>
      </div>

      <div style={{ height: '40%', width: '100%' }}>
        <LocationList history={history} listLoading={listLoading} />
      </div>
    </div>
  );
}


