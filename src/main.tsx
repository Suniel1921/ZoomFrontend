import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// import { BrowserRouter } from 'react-router-dom';
import App from "./App";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";
import { AppointmentProvider } from "./context/AppointmentContext";
import { AccountTaskProvider } from "./context/AccountTaskContext";
import { ChatProvider } from "./context/ChatWithTeamContext";
import ErrorBoundary from "./components/errorBoundary/ErrorBoundary";




createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
    <AuthProvider>
      <AppointmentProvider>
        <AccountTaskProvider>
          <ChatProvider>
            <App />
          </ChatProvider>
        </AccountTaskProvider>
      </AppointmentProvider>
    </AuthProvider>
    </ErrorBoundary>
  </StrictMode>
);
