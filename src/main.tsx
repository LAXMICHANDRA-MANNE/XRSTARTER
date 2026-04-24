import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { msalConfig } from './config/msalConfig';

const msalInstance = new PublicClientApplication(msalConfig);
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'mock-google-client-id';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MsalProvider instance={msalInstance}>
      <GoogleOAuthProvider clientId={googleClientId}>
        <App />
      </GoogleOAuthProvider>
    </MsalProvider>
  </StrictMode>
);
