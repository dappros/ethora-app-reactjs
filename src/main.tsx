import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Fallback } from './App.tsx';
import './index.css';
import { router } from './router.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider
      router={router}
      fallbackElement={<Fallback />}
      future={{
        v7_startTransition: true,
      }}
    />
    <ToastContainer />
  </StrictMode>
);
