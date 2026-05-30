import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center px-md">
          <div className="glass-panel p-lg rounded-xl max-w-md w-full text-center space-y-md border border-white/10">
            <span className="material-symbols-outlined text-red-400 text-[48px]">error_outline</span>
            <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
              Something went wrong
            </h2>
            <p className="text-sm text-on-surface-variant">
              The page encountered an unexpected error. This usually happens when the server is temporarily unavailable.
            </p>
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-sm">
              <code className="text-xs text-red-400 font-data-mono break-all">
                {this.state.error?.message || 'Unknown error'}
              </code>
            </div>
            <button 
              onClick={this.handleReset}
              className="btn-3d-primary px-lg py-sm rounded-lg font-label-sm font-bold text-on-primary-container cursor-pointer transition-all hover:brightness-110"
            >
              Return to Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
