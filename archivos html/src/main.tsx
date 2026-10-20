import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
// Safely suppress unhandled abort errors from aborted network streams/channels
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    if (
      reason?.name === 'AbortError' ||
      reason?.message?.includes?.('aborted') ||
      String(reason).includes('signal is aborted')
    ) {
      event.preventDefault();
    }
  });
}

createRoot(document.getElementById('root')!).render(<App />);
