// DebugBoundary.jsx
import React from 'react';

// Very small wrapper around React 18 error boundaries
export default function DebugBoundary({ children }) {
  return (
    <ErrorBoundary
      fallbackRender={({ error, resetErrorBoundary }) => (
        <div style={{ color: 'red', padding: '1rem' }}>
          <strong>Uncaught error:</strong> {error.message}
          <br />
          <button onClick={resetErrorBoundary}>Retry</button>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}

// ---------- tiny implementation of ErrorBoundary ----------
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      const Fallback = this.props.fallbackRender;
      return <Fallback error={this.state.error} resetErrorBoundary={() => this.setState({ hasError: false, error: null })} />;
    }
    return this.props.children;
  }
}
