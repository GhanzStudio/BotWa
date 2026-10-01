import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Silently ignore WebSocket and Vite HMR disconnection errors (HMR is disabled in preview iframe)
if (typeof window !== 'undefined') {
  const isWsError = (msg: string) => {
    if (!msg) return false;
    const s = msg.toLowerCase();
    return s.includes('websocket') || s.includes('closed without opened') || s.includes('failed to connect to websocket') || s.includes('[vite]');
  };

  window.addEventListener('unhandledrejection', (event) => {
    const msg = event?.reason?.message || String(event?.reason || '');
    if (isWsError(msg)) {
      event.preventDefault();
      event.stopPropagation();
    }
  });

  window.addEventListener('error', (event) => {
    const msg = event?.message || event?.error?.message || String(event || '');
    if (isWsError(msg)) {
      event.preventDefault();
      event.stopPropagation();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
