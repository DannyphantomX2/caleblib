import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import App from './App'
import ErrorBoundary from './components/common/ErrorBoundary'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 3 * 60 * 1000, refetchOnWindowFocus: false }
  }
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              fontFamily: "'Onest', sans-serif",
              fontSize: '14px',
              fontWeight: 500,
              borderRadius: '10px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.12)'
            },
            success: {
              style: { background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0' }
            },
            error: {
              style: { background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' }
            }
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
)
