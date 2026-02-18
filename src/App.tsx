import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { useStore } from './store/useStore';
import { socketService } from './lib/socket';
import { Toast } from './components/Toast';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { AdminLayout } from './layouts/AdminLayout';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f8fafc',
          fontFamily: 'Inter, sans-serif',
          padding: '20px',
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '40px',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            textAlign: 'center',
          }}>
            <h2 style={{ color: '#4ECDC4', fontSize: '24px', marginBottom: '12px' }}>Child Care Compass</h2>
            <p style={{ color: '#64748b', marginBottom: '20px' }}>Something went wrong loading the app.</p>
            <pre style={{ background: '#f1f5f9', padding: '12px', borderRadius: '8px', fontSize: '12px', textAlign: 'left', overflow: 'auto', color: '#ef4444' }}>
              {this.state.error?.message}
            </pre>
            <button
              onClick={() => window.location.reload()}
              style={{ marginTop: '20px', padding: '10px 24px', background: '#4ECDC4', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  const { token, user } = useStore();

  // Connect socket when authenticated
  useEffect(() => {
    if (token && user) {
      socketService.connect(token);
      if (user.id) {
        socketService.joinUser(user.id);
      }
    }

    return () => {
      socketService.disconnect();
    };
  }, [token, user]);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <HashRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <DashboardPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          <Toast />
        </HashRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
