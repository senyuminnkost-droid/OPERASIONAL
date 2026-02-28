
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log("Aplikasi sedang memuat...");

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error("Elemen root tidak ditemukan!");
  throw new Error("Could not find root element to mount to");
}

console.log("Elemen root ditemukan, memulai rendering...");
const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
console.log("Rendering selesai dipanggil.");
