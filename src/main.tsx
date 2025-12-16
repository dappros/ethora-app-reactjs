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
// Must be set up BEFORE any imports that might log warnings
if (import.meta.env.DEV) {
  const originalWarn = console.warn;
  const originalError = console.error;
  
  console.warn = (...args: any[]) => {
    const message = args[0]?.toString() || '';
    const fullMessage = args.map(a => a?.toString() || '').join(' ');
    const lowerMessage = message.toLowerCase();
    const lowerFullMessage = fullMessage.toLowerCase();
    
    if (
      lowerMessage.includes('download the react devtools') ||
      lowerMessage.includes('module "buffer" has been externalized') ||
      lowerMessage.includes('cannot access "buffer.buffer"') ||
      lowerMessage.includes('appjwt is not set') ||
      lowerMessage.includes('non-serializable value') ||
      lowerMessage.includes('selector unknown returned a different result') ||
      lowerMessage.includes('a non-serializable value was detected') ||
      lowerMessage.includes('firebase config not found') ||
      lowerMessage.includes('firebase not ready yet') ||
      lowerMessage.includes('failed to send presence') ||
      lowerFullMessage.includes('non-serializable value') ||
      lowerFullMessage.includes('refreshfunction') ||
      lowerFullMessage.includes('redux.js.org/faq/actions') ||
      lowerFullMessage.includes('redux-toolkit.js.org/usage/usage-guide') ||
      lowerFullMessage.includes('take a look at the logic that dispatched this action')
    ) {
      return; // Suppress these messages
    }
    originalWarn(...args);
  };
  
  // Suppress specific error messages that are not critical
  console.error = (...args: any[]) => {
    const message = args[0]?.toString() || '';
    const fullMessage = args.map(a => a?.toString() || '').join(' ');
    const lowerMessage = message.toLowerCase();
    const lowerFullMessage = fullMessage.toLowerCase();
    
    if (
      lowerMessage.includes('failed to send presence') ||
      lowerMessage.includes('source map error') ||
      lowerMessage.includes('too many calls to location or history apis') ||
      lowerMessage.includes('the operation is insecure') ||
      lowerMessage.includes('non-serializable value') ||
      lowerMessage.includes('a non-serializable value was detected') ||
      lowerFullMessage.includes('non-serializable value') ||
      lowerFullMessage.includes('refreshfunction') ||
      lowerFullMessage.includes('redux.js.org/faq/actions') ||
      lowerFullMessage.includes('redux-toolkit.js.org/usage/usage-guide') ||
      lowerFullMessage.includes('take a look at the logic that dispatched this action')
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
