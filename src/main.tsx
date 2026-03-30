import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ThemeProvider } from './context/ThemeContext.tsx';

// Clean malformed cookies on app start
const cleanMalformedCookies = () => {
  const allCookies = document.cookie.split(';');
  allCookies.forEach(cookie => {
    const [name, value] = cookie.trim().split('=');
    if (name && (name.includes('refresh') || name.includes('access'))) {
      if (name !== 'access_token' && name !== 'refresh_token') {
        console.log(`Deleting malformed cookie on startup: ${name}`);
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      }
    }
  });
};

cleanMalformedCookies();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
);