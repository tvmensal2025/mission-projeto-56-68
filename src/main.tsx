
import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
// PWA service worker registration (Vite style)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const swUrl = '/sw.js';
    navigator.serviceWorker.register(swUrl).catch(() => {
      // no-op
    });
  });
}
import './index.css'
import { supabase } from './integrations/supabase/client'

// Configurar Supabase globalmente para os testes
if (typeof window !== 'undefined') {
  (window as any).supabase = supabase;
}

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

const root = createRoot(rootElement);
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
