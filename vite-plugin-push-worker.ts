import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import type { Plugin } from 'vite';

const WORKER_FILE = 'firebase-messaging-sw.js';

/** Serve the worker that speaks the same push protocol as the installed SDK. */
export function pushWorkerPlugin(): Plugin {
  const require = createRequire(import.meta.url);
  const workerPath = require.resolve(`@ethora/chat-component/public/${WORKER_FILE}`);

  return {
    name: 'ethora-push-worker',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.split('?')[0] !== `/${WORKER_FILE}`) return next();
        res.setHeader('Content-Type', 'application/javascript');
        res.setHeader('Cache-Control', 'no-cache');
        res.end(readFileSync(workerPath));
      });
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: WORKER_FILE, source: readFileSync(workerPath) });
    },
  };
}
