import React, { Component } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: any;
}

// Simple Error Boundary for the root
class RootErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    // @ts-ignore
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Root Error Boundary caught an error:", error, errorInfo);
  }

  render() {
    // @ts-ignore
    if (this.state.hasError) {
      // @ts-ignore
      const err = this.state.error;
      return (
        <div style={{ padding: '20px', textAlign: 'center', color: '#333', fontFamily: 'sans-serif' }}>
          <h1>Something went wrong.</h1>
          <p>The application failed to initialize.</p>
          <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '5px', overflow: 'auto', textAlign: 'left', display: 'inline-block', maxWidth: '100%' }}>
            {err ? err.toString() : 'Unknown error'}
          </pre>
          <br />
          <button
            onClick={() => {
              try {
                localStorage.clear();
              } catch (e) {}
              window.location.reload();
            }}
            style={{ marginTop: '20px', padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}
          >
            Clear Data & Reload Page
          </button>
        </div>
      );
    }
    // @ts-ignore
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  </React.StrictMode>
);
