import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { io } from 'socket.io-client';
import 'leaflet/dist/leaflet.css';

// 🚀 İkon SVG Tanımı
const customSVGIcon = L.divIcon({
  html: `<svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://w3.org"><path d="M12 21C16 17.5 19 14.4087 19 11.2C19 7.22355 15.866 4 12 4C8.13401 4 5 7.22355 5 11.2C5 14.4087 8 17.5 12 21Z" fill="#3B82F6" stroke="white" stroke-width="2"/><circle cx="12" cy="11" r="3" fill="white"/></svg>`,
  className: "custom-gps-icon",
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

// ✅ ADRESLER DÜZELTİLDİ
const BACKEND_URL = "https://livegps-location.onrender.com";
const socket = io(BACKEND_URL);

// 📍 Haritayı merkeze alan yardımcı bileşen
function RecenterMap({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.flyTo(coords, 16); // Konum gelince haritayı oraya uçurur
    }
  }, [coords, map]);
  return null;
}

export default function LiveMap() {
  const [locations, setLocations] = useState({});
  const [myId] = useState("Cihaz_" + Math.random().toString(36).substr(2, 4));
  const [loading, setLoading] = useState(true);
  const [myFirstCoords, setMyFirstCoords] = useState(null); // İlk odaklama için

  const saveCurrentLocation = async () => {
    const myCurrentPos = locations[myId]; 
    if (!myCurrentPos) {
      alert("⚠️ Konum verisi henüz gelmedi, lütfen bekleyin.");
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

      if (response.ok) alert("✅ Konum başarıyla kaydedildi!");
      else alert("❌ Sunucu hatası: " + response.status);
    } catch (error) {
      alert("❌ Bağlantı hatası: Backend çalışmıyor olabilir.");
    }
  };

  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        
        // Sunucuya gönder
        socket.emit('konumGonder', { id: myId, lat: latitude, lng: longitude });
        
        // Yerel state'i güncelle (İkonun görünmesi için şart!)
        setLocations(prev => ({ ...prev, [myId]: [latitude, longitude] }));
        
        if (loading) {
          setMyFirstCoords([latitude, longitude]);
          setLoading(false);
        }
      },
      (err) => {
        console.error("GPS Hatası:", err);
        if(err.code === 1) alert("Lütfen tarayıcıdan konum izni verin!");
        setLoading(false);
      },
      { enableHighAccuracy: true, distanceFilter: 2 }
    );

    socket.on('konumAl', (data) => {
      setLocations(prev => ({ ...prev, [data.id]: [data.lat, data.lng] }));
    });

    return () => {
      navigator.geolocation.clearWatch(watchId);
      socket.off('konumAl');
    };
  }, [myId, loading]);

  return (
    <div style={{ height: "100vh", width: "100%", position: "relative", backgroundColor: '#f3f4f6' }}>
      
      {loading && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: '#ffffff', zIndex: 9999, display: 'flex',
          flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            width: '50px', height: '50px', border: '5px solid #f3f3f3',
            borderTop: '5px solid #3B82F6', borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{ marginTop: '20px', fontFamily: 'sans-serif', color: '#4b5563' }}>
            GPS Bekleniyor... (İzin vermeyi unutmayın)
          </p>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      <MapContainer center={[41.0082, 28.9784]} zoom={13} style={{ height: "100%", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        
        {/* İlk konum gelince haritayı oraya odakla */}
        {myFirstCoords && <RecenterMap coords={myFirstCoords} />}

        {Object.entries(locations).map(([id, position]) => (
         <Marker key={id} position={position} icon={customSVGIcon}>
           <Popup>{id === myId ? "Siz" : `Cihaz: ${id}`}</Popup>
         </Marker>
        ))}
      </MapContainer>

      <button 
        onClick={saveCurrentLocation}
        style={{
          position: 'absolute', bottom: '100px', right: '20px', zIndex: 1000,
          padding: '16px 24px', backgroundColor: '#3B82F6', color: 'white',
          border: 'none', borderRadius: '50px', fontWeight: 'bold', fontSize: '16px',
          boxShadow: '0 8px 25px rgba(0,0,0,0.3)', cursor: 'pointer',
          WebkitAppearance: 'none' // Android buton stili için
        }}
      >
        💾 Konumu Kaydet
      </button>
    </div>
  );
}



