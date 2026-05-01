
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Yazdığımız tam ekran CSS'i
import App from './App';

// Leaflet CSS'ini burada import etmek, haritanın bozuk görünmesini engeller
import 'leaflet/dist/leaflet.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
