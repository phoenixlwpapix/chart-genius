import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log("🚀 Starting ChartGenius AI...");

const rootElement = document.getElementById('root');
if (!rootElement) {
  const msg = "Could not find root element to mount to";
  console.error(msg);
  throw new Error(msg);
}

try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("✅ React App mounted successfully.");
} catch (err) {
    console.error("❌ Failed to mount React App:", err);
}
