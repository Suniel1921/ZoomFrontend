import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { AppointmentProvider } from './context/AppointmentContext';


createRoot(document.getElementById('root')!).render(
  <StrictMode>
<AuthProvider>
  <AppointmentProvider>
  <App />
  </AppointmentProvider>
</AuthProvider>
  
  </StrictMode>
);