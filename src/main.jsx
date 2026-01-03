import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Adicionar classe de transição ao body
document.body.classList.add('theme-transition');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);