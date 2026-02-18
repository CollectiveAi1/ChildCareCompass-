import React from 'react';
import ReactDOM from 'react-dom/client';

// Super simple test app
const TestApp = () => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: 'linear-gradient(135deg, #4ECDC4 0%, #FF6B9D 100%)',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '20px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
        textAlign: 'center'
      }}>
        <h1 style={{ color: '#333', marginBottom: '20px' }}>🎉 React is Working!</h1>
        <p style={{ color: '#4ECDC4', fontWeight: 'bold', fontSize: '20px' }}>
          ✅ Child Care Compass
        </p>
        <p>The React app is loading correctly.</p>
      </div>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<TestApp />);
