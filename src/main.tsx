import { XmppProvider } from '@ethora/chat-component';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Fallback } from './App.tsx';
import { RouterErrorBoundary } from './components/Error/RouterErrorBoundary';
import './index.css';
import { router } from './router.tsx';

// Suppress noisy console warnings in development
if (import.meta.env.DEV) {
  const originalWarn = console.warn;
  const originalError = console.error;
  
  console.warn = (...args: any[]) => {
    const message = args[0]?.toString() || '';
    const fullMessage = args.map(a => a?.toString() || '').join(' ');
    if (
      message.includes('Download the React DevTools') ||
      message.includes('Module "buffer" has been externalized') ||
      message.includes('Cannot access "buffer.Buffer"') ||
      message.includes('appJwt is not set') ||
      message.includes('non-serializable value') ||
      message.includes('Selector unknown returned a different result') ||
      message.includes('A non-serializable value was detected') ||
      message.includes('Firebase config not found') ||
      message.includes('Firebase not ready yet') ||
      message.includes('Failed to send presence') ||
      fullMessage.includes('non-serializable value') ||
      fullMessage.includes('refreshFunction') ||
      fullMessage.includes('redux.js.org/faq/actions') ||
      fullMessage.includes('redux-toolkit.js.org/usage/usage-guide')
    ) {
      return; // Suppress these messages
    }
    originalWarn(...args);
  };
  
  // Suppress specific error messages that are not critical
  console.error = (...args: any[]) => {
    const message = args[0]?.toString() || '';
    const fullMessage = args.map(a => a?.toString() || '').join(' ');
    if (
      message.includes('Failed to send presence in response to error') ||
      message.includes('Source map error') ||
      message.includes('Too many calls to Location or History APIs') ||
      message.includes('The operation is insecure') ||
      message.includes('non-serializable value') ||
      fullMessage.includes('non-serializable value') ||
      fullMessage.includes('refreshFunction') ||
      fullMessage.includes('redux.js.org/faq/actions') ||
      fullMessage.includes('redux-toolkit.js.org/usage/usage-guide') ||
      message.includes('A non-serializable value was detected') ||
      fullMessage.includes('Take a look at the logic that dispatched this action') ||
      fullMessage.includes('non-serializable value') ||
      fullMessage.includes('refreshFunction') ||
      fullMessage.includes('redux.js.org/faq/actions') ||
      fullMessage.includes('redux-toolkit.js.org/usage/usage-guide')
    ) {
      return; // Suppress these non-critical errors
    }
    originalError(...args);
  };
}

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
