import React from 'react';

interface AppErrorBoundaryState {
  hasError: boolean;
  errorMessage: string | null;
}

export class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = {
    hasError: false,
    errorMessage: null,
  };

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Critical UI render failure:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="max-w-lg w-full rounded-2xl bg-white shadow-soft border border-slate-200 p-8 text-center">
            <h1 className="text-2xl font-black text-slate-900 mb-3">Something went wrong</h1>
            <p className="text-slate-600 mb-6">
              The app hit an unexpected rendering error. Please reload the page.
            </p>
            {this.state.errorMessage && (
              <pre className="text-left text-xs bg-slate-100 rounded-xl p-3 text-slate-700 overflow-x-auto mb-6">
                {this.state.errorMessage}
              </pre>
            )}
            <button
              onClick={this.handleReload}
              className="bg-brand-teal text-white px-5 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity"
            >
              Reload application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
