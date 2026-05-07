import { XmppProvider } from '@ethora/chat-component';
import { useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Fallback } from './App.tsx';
import { RouterErrorBoundary } from './components/Error/RouterErrorBoundary';
import { buildEthoraBaseChatConfig } from './config/chatBootstrap';
import './index.css';
import { router } from './router.tsx';
import { useAppStore } from './store/useAppStore';

// Suppress noisy console warnings in development
// Must be set up BEFORE any imports that might log warnings
if (import.meta.env.DEV) {
  const originalWarn = console.warn;
  const originalError = console.error;
  
  console.warn = (...args: unknown[]) => {
    // Convert all arguments to strings and check
    const allMessages = args.map(a => {
      if (typeof a === 'string') return a;
      if (typeof a === 'object' && a !== null) {
        try {
          return JSON.stringify(a);
        } catch {
          return String(a);
        }
      }
      return String(a);
    }).join(' ').toLowerCase();
    
    if (
      allMessages.includes('download the react devtools') ||
      allMessages.includes('module "buffer" has been externalized') ||
      allMessages.includes('cannot access "buffer.buffer"') ||
      allMessages.includes('appjwt is not set') ||
      allMessages.includes('non-serializable value') ||
      allMessages.includes('selector unknown returned a different result') ||
      allMessages.includes('a non-serializable value was detected') ||
      allMessages.includes('non-serializable value was detected in an action') ||
      allMessages.includes('firebase config not found') ||
      allMessages.includes('firebase not ready yet') ||
      allMessages.includes('failed to send presence') ||
      allMessages.includes('payload.refreshtokens.refreshfunction') ||
      allMessages.includes('refreshfunction') ||
      allMessages.includes('refresh function') ||
      allMessages.includes('chatsettingstore/setconfig') ||
      allMessages.includes('redux.js.org/faq/actions') ||
      allMessages.includes('redux-toolkit.js.org/usage/usage-guide') ||
      allMessages.includes('take a look at the logic that dispatched this action') ||
      allMessages.includes('tracking is disabled on localhost') ||
      allMessages.includes('see https://redux.js.org/faq/actions') ||
      allMessages.includes('to allow non-serializable values see')
    ) {
      return; // Suppress these messages
    }
    originalWarn(...args);
  };
  
  // Suppress specific error messages that are not critical
  console.error = (...args: unknown[]) => {
    // Convert all arguments to strings and check
    const allMessages = args.map(a => {
      if (typeof a === 'string') return a;
      if (typeof a === 'object' && a !== null) {
        try {
          return JSON.stringify(a);
        } catch {
          return String(a);
        }
      }
      return String(a);
    }).join(' ').toLowerCase();
    
    if (
      allMessages.includes('failed to send presence') ||
      allMessages.includes('source map error') ||
      allMessages.includes('too many calls to location or history apis') ||
      allMessages.includes('the operation is insecure') ||
      allMessages.includes('non-serializable value') ||
      allMessages.includes('a non-serializable value was detected') ||
      allMessages.includes('non-serializable value was detected in an action') ||
      allMessages.includes('payload.refreshtokens.refreshfunction') ||
      allMessages.includes('refreshfunction') ||
      allMessages.includes('refresh function') ||
      allMessages.includes('chatsettingstore/setconfig') ||
      allMessages.includes('redux.js.org/faq/actions') ||
      allMessages.includes('redux-toolkit.js.org/usage/usage-guide') ||
      allMessages.includes('take a look at the logic that dispatched this action') ||
      allMessages.includes('see https://redux.js.org/faq/actions') ||
      allMessages.includes('to allow non-serializable values see') ||
      allMessages.includes('why-should-type-be-a-string') ||
      allMessages.includes('working-with-non-serializable-data')
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

function XmppProviderBridge({ children }: { children: React.ReactNode }) {
  const currentUser = useAppStore((s) => s.currentUser);
  const providerConfig = useMemo(
    () =>
      buildEthoraBaseChatConfig({
        chat_token: currentUser?.token || null,
        currentUser,
      }),
    [currentUser]
  );

  return <XmppProvider config={providerConfig}>{children}</XmppProvider>;
}

createRoot(document.getElementById('root')!).render(
  <XmppProviderBridge>
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
  </XmppProviderBridge>
);
