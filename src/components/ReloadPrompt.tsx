import { useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

function ReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady] = useState(false),
    needRefresh: [needRefresh, setNeedRefresh] = useState(false),
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered:', r);
    },
    onRegisterError(error) {
      console.log('SW registration error:', error);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  return (
    <div className="fixed bottom-0 right-0 m-4 p-3 bg-white rounded-lg shadow-lg">
      {(offlineReady || needRefresh) && (
        <div className="flex flex-col items-center">
          <div className="mb-2">
            {offlineReady ? (
              <span>App ready to work offline</span>
            ) : (
              <span>New content available, click on reload button to update.</span>
            )}
          </div>
          {needRefresh && (
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={() => updateServiceWorker(true)}
            >
              Reload
            </button>
          )}
          <button
            className="mt-2 text-sm text-gray-500 hover:text-gray-700"
            onClick={() => close()}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}

export default ReloadPrompt; 