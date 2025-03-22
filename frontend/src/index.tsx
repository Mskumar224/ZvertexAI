import React from 'react';
import { createRoot } from 'react-dom/client'; // Changed from ReactDOM
import './index.css';
import App from './App';

const container = document.getElementById('root');
const root = createRoot(container!); // Use createRoot instead of render
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);