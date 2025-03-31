import { XmppProvider } from '@ethora/chat-component';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Fallback } from './App.tsx';
import './index.css';
import { router } from './router.tsx';
import { registerSW } from 'virtual:pwa-register';

void registerSW({
  onNeedRefresh() {
    console.log('New content available, click on reload button to update.');
  },
  onOfflineReady() {
    console.log('App ready to work offline');
  },
  onRegistered(r) {
    console.log('SW Registered:', r);
  },
  onRegisterError(error) {
    console.log('SW registration error:', error);
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <XmppProvider>
      <RouterProvider
        router={router}
        fallbackElement={<Fallback />}
        future={{
          v7_startTransition: true,
        }}
      />
      <ToastContainer />
    </XmppProvider>
  </StrictMode>
);
