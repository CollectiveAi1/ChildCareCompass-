import React from 'react';
import ReactDOM from 'react-dom/client';

// Minimal test - just render something simple
const TestApp = () => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #4ECDC4 0%, #FF6B9D 100%)',
      fontFamily: 'Arial, sans-serif',
      color: 'white',
      textAlign: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        color: '#333',
        padding: '60px 40px',
        borderRadius: '30px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        maxWidth: '500px'
      }}>
        <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>🎉</h1>
        <h2 style={{ fontSize: '32px', marginBottom: '10px', color: '#4ECDC4' }}>
          Child Care Compass
        </h2>
        <p style={{ fontSize: '18px', marginBottom: '30px', color: '#666' }}>
          Welcome! The app is loading successfully.
        </p>
        <div style={{
          background: '#f0f0f0',
          padding: '20px',
          borderRadius: '10px',
          fontSize: '14px',
          color: '#666'
        }}>
          <p><strong>Status:</strong> ✅ React is running</p>
          <p><strong>Build:</strong> Production</p>
        </div>
      </div>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<TestApp />);
