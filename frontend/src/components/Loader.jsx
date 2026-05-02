
import React from 'react';

const Loader = ({ message = "Yükleniyor...", size = "50px", fullScreen = false }) => {
  const loaderStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    ...(fullScreen && {
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      backgroundColor: '#ffffff', zIndex: 9999
    })
  };

  const spinnerStyle = {
    width: size,
    height: size,
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #3B82F6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  };

  return (
    <div style={loaderStyle}>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      <div style={spinnerStyle}></div>
      <p style={{ marginTop: '15px', color: '#4b5563', fontFamily: 'sans-serif', fontWeight: '500' }}>
        {message}
      </p>
    </div>
  );
};

export default Loader;
