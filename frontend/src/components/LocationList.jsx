import React from 'react';
import Loader from './Loader'; // Ortak Loader bileşenini içe aktarıyoruz

const LocationList = ({ history, listLoading }) => {
  return (
    <div style={{
      height: '100%',
      overflowY: 'auto',
      backgroundColor: '#ffffff',
      padding: '15px',
      borderTop: '1px solid #e5e7eb',
      fontFamily: 'sans-serif'
    }}>
      {/* BAŞLIK ALANI */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '15px',
        position: 'sticky',
        top: 0,
        backgroundColor: '#fff',
        paddingBottom: '10px',
        zIndex: 10
      }}>
        <h3 style={{ margin: 0, color: '#1f2937', fontSize: '18px' }}>📜 Kayıt Geçmişi</h3>
        {!listLoading && (
          <span style={{ fontSize: '12px', color: '#6b7280', backgroundColor: '#f3f4f6', padding: '4px 8px', borderRadius: '10px' }}>
            {history.length} Kayıt
          </span>
        )}
      </div>

      {/* 🌀 LİSTE YÜKLENİYORSA LOADER GÖSTER */}
      {listLoading ? (
        <div style={{ marginTop: '30px' }}>
          <Loader message="Veriler güncelleniyor..." size="30px" />
        </div>
      ) : history.length === 0 ? (
        /* KAYIT YOKSA MESAJ GÖSTER */
        <div style={{ textAlign: 'center', marginTop: '40px', color: '#9ca3af' }}>
          <p>Henüz kaydedilmiş bir konum bulunmuyor.</p>
          <small>Harita üzerindeki butona basarak ilk kaydı oluşturun.</small>
        </div>
      ) : (
        /* KAYITLAR VARSA TABLOYU GÖSTER */
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb', textAlign: 'left', borderBottom: '2px solid #f3f4f6' }}>
              <th style={{ padding: '12px', color: '#4b5563', fontWeight: '600' }}>Tarih</th>
              <th style={{ padding: '12px', color: '#4b5563', fontWeight: '600' }}>Koordinatlar</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item, index) => (
              <tr key={item.id || index} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '12px', color: '#374151' }}>
                  {new Date(item.tarih).toLocaleString('tr-TR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </td>
                <td style={{ padding: '12px', color: '#2563eb', fontWeight: '500' }}>
                  {item.latitude?.toFixed(5)} , {item.longitude?.toFixed(5)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default LocationList;


