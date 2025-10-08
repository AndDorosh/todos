import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import '@/styles/index.css';

const saved = localStorage.getItem('theme'); // 'dark' | 'light' | null
if (saved === 'dark') {
    document.documentElement.classList.add('dark');
} else {
    document.documentElement.classList.remove('dark');
}

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Root element not found');
const root = ReactDOM.createRoot(rootEl);

root.render(
    <React.StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </React.StrictMode>
);
