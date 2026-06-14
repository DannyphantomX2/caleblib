import { Component } from 'react'
import Btn from './Btn'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          minHeight: '60vh', padding: 40, textAlign: 'center'
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16,
            background: '#fef2f2', border: '1px solid #fecaca',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, marginBottom: 20
          }}>⚠️</div>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Something went wrong</h2>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24, maxWidth: 400, lineHeight: 1.6 }}>
            An unexpected error occurred. Try refreshing the page — if it keeps happening, contact your administrator.
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <Btn onClick={() => window.location.reload()}>Refresh Page</Btn>
            <Btn variant="secondary" onClick={() => this.setState({ hasError: false, error: null })}>
              Try Again
            </Btn>
          </div>
          {import.meta.env.DEV && this.state.error && (
            <details style={{ marginTop: 24, textAlign: 'left', maxWidth: 600 }}>
              <summary style={{ fontSize: 12, color: 'var(--text-muted)', cursor: 'pointer', marginBottom: 8 }}>Error details (dev only)</summary>
              <pre style={{ fontSize: 11, color: '#ef4444', background: '#fef2f2', padding: 12, borderRadius: 8, overflow: 'auto' }}>
                {this.state.error.toString()}
              </pre>
            </details>
          )}
        </div>
      )
    }
    return this.props.children
  }
}
export default ErrorBoundary
