import React from 'react';
import Loader from './Loader';

const LocationList = ({ history, listLoading }) => {
  return (
    <div style={{
      height: '100%',
      overflowY: 'auto',
      backgroundColor: '#ffffff',
      borderTop: '1px solid #e5e7eb',
      fontFamily: 'sans-serif',
      position: 'relative',
      scrollBehavior: 'smooth', // Yumuşak kaydırma
      WebkitOverflowScrolling: 'touch' // iOS için akıcı kaydırma
    }}>
      {/* 1. ÜST BAŞLIK (Sabit) */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '16px 20px',
        position: 'sticky',
        top: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.95)', // Hafif şeffaf modern görünüm
        backdropFilter: 'blur(10px)', // Arka planı bulanıklaştırır
        zIndex: 30,
        boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
        borderBottom: '1px solid #f3f4f6'
      }}>
        <h3 style={{ margin: 0, color: '#111827', fontSize: '18px', fontWeight: '800', letterSpacing: '-0.5px' }}>
          📜 Kayıt Geçmişi
        </h3>
        {!listLoading && (
          <span style={{ 
            fontSize: '11px', 
            color: '#3B82F6', 
            backgroundColor: '#EFF6FF', 
            padding: '5px 12px', 
            borderRadius: '12px', 
            fontWeight: '800'
          }}>
            {history.length} NOKTA
          </span>
        )}
      </div>

      <div style={{ padding: '0' }}>
        {listLoading ? (
          <div style={{ marginTop: '50px' }}>
            <Loader message="Veriler senkronize ediliyor..." size="32px" />
          </div>
        ) : history.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: '60px', color: '#9ca3af', animation: 'proEaseFade 0.8s forwards' }}>
            <p>Kayıtlı konum bulunamadı.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            {/* 2. TABLO BAŞLIĞI (Sticky ve İnce Stil) */}
            <thead style={{ position: 'sticky', top: '57px', zIndex: 20 }}>
              <tr>
                <th style={headerStyle}>TARİH</th>
                <th style={headerStyle}>KOORDİNATLAR</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item, index) => (
                <tr 
                  key={item.id || index} 
                  style={{ 
                    borderBottom: '1px solid #f9fafb',
                    // ✨ PRO EASE EFEKTİ: cubic-bezier ile özel ivmelenme
                    animation: `proEaseSlideUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${index * 0.04}s both`
                  }}
                  className="list-row"
                >
                  <td style={{ padding: '16px 20px', color: '#6b7280', fontSize: '13px' }}>
                    {new Date(item.tarih).toLocaleString('tr-TR', {
                      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
                    })}
                  </td>
                  <td style={{ padding: '16px 20px', color: '#2563eb', fontWeight: '700', fontSize: '14px' }}>
                    {item.latitude?.toFixed(5)} <span style={{ color: '#e5e7eb', margin: '0 4px' }}>/</span> {item.longitude?.toFixed(5)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ✅ CSS ANİMASYONLARI (Pro Ease Hız Eğrisi) */}
      <style>{`
        @keyframes proEaseSlideUp {
          0% { 
            opacity: 0; 
            transform: translateY(20px) scale(0.98); 
          }
          100% { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }
        
        @keyframes proEaseFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .list-row:active {
          background-color: #f0f7ff;
          transition: background-color 0.1s;
        }

        /* Kaydırma çubuğunu şıklaştır */
        ::-webkit-scrollbar {
          width: 5px;
        }
        ::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

const headerStyle = {
  padding: '10px 20px',
  color: '#9ca3af',
  fontSize: '10px',
  fontWeight: 'bold',
  letterSpacing: '1.2px',
  backgroundColor: '#f9fafb',
  textAlign: 'left',
  borderBottom: '1px solid #f3f4f6'
};

export default LocationList;



