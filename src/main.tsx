import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/nunito/latin-400.css';
import '@fontsource/nunito/latin-600.css';
import '@fontsource/caveat/latin-400.css';
import '@fontsource/cinzel-decorative/latin-400.css';
import './styles/tokens.css';
import './styles/global.css';
import { App } from './app/App';

const root = document.getElementById('root');
if (!root) throw new Error('App root missing');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
