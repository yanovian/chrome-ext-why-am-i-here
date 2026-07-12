import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { UnheadProvider, createHead } from '@unhead/react/client';
import { App } from '@/App';
import '@/i18n';
import '@/styles/global.css';

const head = createHead();

const root = document.getElementById('root');
if (!root) {
  throw new Error('Root element not found');
}

createRoot(root).render(
  <StrictMode>
    <UnheadProvider head={head}>
      <App />
    </UnheadProvider>
  </StrictMode>,
);
