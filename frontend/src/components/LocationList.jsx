import React from 'react';
import Loader from './Loader';
import './LocationList.css'; // 👈 CSS dosyamızı ekledik

const LocationList = ({ history, listLoading }) => {
  return (
    <div className="location-list-container">
      {/* 1. ÜST BAŞLIK */}
      <div className="list-header-main">
        <h3>📜 Kayıt Geçmişi</h3>
        {!listLoading && (
          <span className="record-count-badge">
            {history.length} KAYIT
          </span>
        )}
      </div>

      <div style={{ padding: '0' }}>
        {listLoading ? (
          <div style={{ marginTop: '50px' }}>
            <Loader message="Bulut verileri senkronize ediliyor..." size="32px" />
          </div>
        ) : history.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: '60px', color: '#9ca3af' }}>
            <p>Henüz bir konum kaydı bulunmuyor.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead className="sticky-table-thead">
              <tr>
                <th>Tarih</th>
                <th>Koordinatlar</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item, index) => (
                <tr 
                  key={item.id || index} 
                  className="list-row"
                  style={{ animationDelay: `${index * 0.04}s` }} // Dalga efekti için gecikme
                >
                  <td className="date-cell">
                    {new Date(item.tarih).toLocaleString('tr-TR', {
                      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
                    })}
                  </td>
                  <td className="coord-cell">
                    {item.latitude?.toFixed(5)} 
                    <span className="coord-divider">/</span> 
                    {item.longitude?.toFixed(5)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default LocationList;


