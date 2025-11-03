import { XmppProvider } from '@ethora/chat-component';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Fallback } from './App.tsx';
import { RouterErrorBoundary } from './components/Error/RouterErrorBoundary';
import './index.css';
import { router } from './router.tsx';

const originalRemoveChild = Node.prototype.removeChild;
Node.prototype.removeChild = function <T extends Node>(child: T): T {
  try {
    if (
      this.contains &&
      this.contains(child) &&
      (this === child.parentNode || child.parentNode === this)
    ) {
      return originalRemoveChild.call(this, child) as T;
    } else {
      return child;
    }
  } catch (error) {
    if (
      error instanceof DOMException &&
      (error.name === 'NotFoundError' ||
        error.message?.includes('not a child') ||
        error.message?.includes('removeChild'))
    ) {
      return child;
    }
    throw error;
  }
};

window.addEventListener('error', (event) => {
  if (
    event.error?.name === 'NotFoundError' &&
    event.error?.message?.includes('removeChild') &&
    event.error?.message?.includes('not a child')
  ) {
    event.preventDefault();
    event.stopPropagation();
    return false;
  }
}, true);

window.addEventListener('unhandledrejection', (event) => {
  if (
    event.reason?.name === 'NotFoundError' &&
    event.reason?.message?.includes('removeChild') &&
    event.reason?.message?.includes('not a child')
  ) {
    event.preventDefault();
    return false;
  }
});

createRoot(document.getElementById('root')!).render(
  // @ts-ignore
  <XmppProvider>
    <RouterErrorBoundary>
      <RouterProvider
        router={router}
        fallbackElement={<Fallback />}
        future={{
          v7_startTransition: true,
        }}
      />
    </RouterErrorBoundary>
    <ToastContainer />
  </XmppProvider>
);
