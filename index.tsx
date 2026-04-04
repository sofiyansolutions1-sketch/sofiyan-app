import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { getCoordinatesWithGemini, getAddressSuggestions, reverseGeocodeWithGemini } from './services/geminiService';

// Expose to window for vanilla JS usage
(window as any).getCoordinatesWithGemini = getCoordinatesWithGemini;
(window as any).getAddressSuggestions = getAddressSuggestions;
(window as any).reverseGeocodeWithGemini = reverseGeocodeWithGemini;

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);