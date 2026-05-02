import React from 'react';

const LocationList = ({ history }) => {
  return (
    <div style={{
      height: '100%',
      overflowY: 'auto',
      backgroundColor: '#ffffff',
      padding: '15px',
      borderTop: '1px solid #e5e7eb',
      boxShadow: '0 -2px 10px rgba(0,0,0,0.05)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ margin: 0, color: '#1f2937', fontSize: '18px' }}>📜 Kayıt Geçmişi</h3>
        <span style={{ fontSize: '12px', color: '#6b7280' }}>Toplam: {history.length} Kayıt</span>
      </div>

      {history.length === 0 ? (
        <p style={{ color: '#9ca3af', textAlign: 'center', marginTop: '20px' }}>Henüz kayıtlı konum bulunmuyor.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb', textAlign: 'left', borderBottom: '2px solid #f3f4f6' }}>
              <th style={{ padding: '12px', color: '#4b5563' }}>Tarih</th>
              <th style={{ padding: '12px', color: '#4b5563' }}>Koordinatlar</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item, index) => (
              <tr key={item.id || index} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '12px', color: '#374151' }}>
                  {new Date(item.tarih).toLocaleString('tr-TR', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </td>
                <td style={{ padding: '12px', color: '#2563eb', fontWeight: '500' }}>
                  {item.latitude?.toFixed(5)}, {item.longitude?.toFixed(5)}
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

