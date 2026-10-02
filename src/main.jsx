import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { BasketProvider } from './context/BasketContext';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <BasketProvider>
        <App />
      </BasketProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
