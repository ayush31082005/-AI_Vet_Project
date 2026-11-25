import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AppRoutes as App } from './App';
import './index.css';
const root = <BrowserRouter><App /></BrowserRouter>;
createRoot(document.getElementById('root')).render(import.meta.env.VITE_GOOGLE_CLIENT_ID ? <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>{root}</GoogleOAuthProvider> : root);
