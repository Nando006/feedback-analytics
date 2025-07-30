import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Source from './routes/source';
import 'styles/imports.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Source />
  </StrictMode>,
);
