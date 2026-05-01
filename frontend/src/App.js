import React from 'react';
import LiveMap from './components/LiveMap';

function App() {
  return (
    <div className="App">
      {/* Harita Bileşeni */}
      <LiveMap />
      
      {/* İstersen buraya bir başlık katmanı ekleyebilirsin */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '50px',
        zIndex: 1000,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        padding: '10px',
        borderRadius: '5px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
        pointerEvents: 'none' // Haritaya tıklamayı engellememesi için
      }}>
        <h4 style={{ margin: 0 }}>Canlı GPS Takip Sistemi</h4>
        <small>Supabase & Socket.io</small>
      </div>
    </div>
  );
}

export default App;

