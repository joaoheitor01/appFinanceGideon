import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import App from './App';
import './styles/index.css';
import './styles/design-system.css';
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import { registerChartComponents } from './utils/chartRegistry'; // Import the chart registration utility


import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';

Sentry.init({
  dsn: "YOUR_SENTRY_DSN_HERE", // Replace with your actual DSN
  integrations: [
    new BrowserTracing(),
  ],
  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production.
  tracesSampleRate: 1.0,
});

// Register Chart.js components globally
registerChartComponents();

// Create a client
const queryClient = new QueryClient();

// Placeholder for global SEO metadata (e.g., Schema.org JSON-LD) that would typically be added in the <head>
// This is usually handled at the document level (e.g., in public/index.html or a server-side rendering setup)
// or by a dedicated SEO library/component that injects into the head.
// Example:
/*
<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Gideon Finance Dashboard",
    "description": "Dashboard para gerenciamento financeiro pessoal.",
    "publisher": {
      "@type": "Organization",
      "name": "Gideon Finance"
    }
  }
</script>
*/

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);
