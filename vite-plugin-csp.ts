import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Plugin } from 'vite';

const THIRD_PARTY = {
  // Loaders injected at runtime by hooks/withTracking.tsx + SDKs.
  script: [
    'https://www.googletagmanager.com',
    'https://www.google-analytics.com',
    'https://*.clarity.ms',
    'https://js.stripe.com',
    'https://challenges.cloudflare.com',
    'https://apis.google.com',
    'https://us-assets.i.posthog.com',
  ],
  connect: [
    'https://www.googletagmanager.com',
    'https://www.google-analytics.com',
    'https://*.google-analytics.com',
    'https://*.analytics.google.com',
    'https://*.clarity.ms',
    'https://api.stripe.com',
    'https://challenges.cloudflare.com',
    'https://api.hsforms.com',
    'https://*.googleapis.com',
    'https://*.firebaseio.com',
    'https://us.i.posthog.com',
    'https://us-assets.i.posthog.com',
  ],
  frame: [
    'https://js.stripe.com',
    'https://hooks.stripe.com',
    'https://challenges.cloudflare.com',
    'https://form.jotform.com',
    'https://accounts.google.com',
    'https://*.firebaseapp.com',
  ],
  style: ['https://fonts.googleapis.com'],
  font: ['https://fonts.gstatic.com'],
};

function originsFrom(value?: string): string[] {
  if (!value) return [];

  const raw = value.trim();
  if (!raw) return [];

  try {
    const url = new URL(raw.includes('://') ? raw : `https://${raw}`);
    const origins = new Set<string>();

    origins.add(url.origin);
    origins.add(url.origin.replace(/^http/, 'ws'));

    const labels = url.hostname.split('.');
    if (labels.length >= 3) {
      const parent = labels.slice(1).join('.');
      origins.add(`https://*.${parent}:*`);
      origins.add(`wss://*.${parent}:*`);
    }

    return [...origins];
  } catch {
    console.warn(`[csp] ignoring unparseable origin: ${raw}`);
    return [];
  }
}

const ENV_ORIGIN_KEYS = [
  'VITE_API',
  'VITE_API_V2',
  'VITE_APP_XMPP_SERVICE',
  'VITE_XMPP_HOST',
  'VITE_LIVEKIT_URL',
  'VITE_TRANSLATE_ENDPOINT',
  'VITE_QR_URL',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_STORAGE_BUCKET',
];

const unique = (values: string[]) => [...new Set(values.filter(Boolean))];

// Placeholder written into connect-src when the bundle is built for
// runtime configuration (VITE_RUNTIME_CONFIG=true). The container entrypoint
// replaces it with the origins derived from its environment, mirroring
// originsFrom() above (see docker/entrypoint.sh). A leftover placeholder is
// an invalid source expression that browsers ignore, so a bundle served
// without the entrypoint fails closed rather than open.
export const CSP_RUNTIME_PLACEHOLDER = '__ETHORA_CSP_ENV_ORIGINS__';

export function buildCspPolicy(env: Record<string, string>): string {
  const runtime = String(env.VITE_RUNTIME_CONFIG || '').toLowerCase() === 'true';
  const envOrigins = runtime
    ? [CSP_RUNTIME_PLACEHOLDER]
    : unique(ENV_ORIGIN_KEYS.flatMap((key) => originsFrom(env[key])));

  const directives: Record<string, string[]> = {
    'default-src': ["'self'"],
    'script-src': unique([
      "'self'",
      "'unsafe-inline'",
      "'unsafe-eval'",
      ...THIRD_PARTY.script,
    ]),
    'style-src': unique(["'self'", "'unsafe-inline'", ...THIRD_PARTY.style]),
    'font-src': unique(["'self'", 'data:', ...THIRD_PARTY.font]),
    'img-src': ["'self'", 'data:', 'blob:', 'https:'],
    'media-src': ["'self'", 'blob:', 'data:', 'https:'],
    'connect-src': unique([
      "'self'",
      'blob:',
      'data:',
      ...envOrigins,
      ...THIRD_PARTY.connect,
    ]),
    'frame-src': unique(["'self'", ...THIRD_PARTY.frame]),
    'worker-src': ["'self'", 'blob:'],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
  };

  return Object.entries(directives)
    .map(([name, values]) => `${name} ${values.join(' ')}`)
    .join('; ');
}

// The "Try it on your site" demo page (/try/<site>/<token>) frames the named
// website, which can be any https site. Only that page may do so: the build
// writes try.html, the entry document with `https:` added to frame-src, and the
// web server serves it for /try/ alone. Every other page keeps the list above.
export function tryPageHtml(html: string): string {
  let changed = false;
  const out = html.replace(/(frame-src)([^;"]*)/, (_m, name: string, values: string) => {
    changed = true;
    return values.split(/\s+/).includes('https:') ? `${name}${values}` : `${name}${values} https:`;
  });
  if (!changed) throw new Error('[csp] no frame-src in index.html: cannot write try.html');
  return out;
}

export function cspPlugin(env: Record<string, string>): Plugin {
  let outDir = 'dist';
  return {
    name: 'ethora-csp',
    apply: 'build',
    configResolved(config) {
      outDir = join(config.root, config.build.outDir);
    },
    writeBundle() {
      const index = join(outDir, 'index.html');
      if (existsSync(index)) writeFileSync(join(outDir, 'try.html'), tryPageHtml(readFileSync(index, 'utf8')));
    },
    transformIndexHtml() {
      return [
        {
          tag: 'meta',
          attrs: {
            'http-equiv': 'Content-Security-Policy',
            content: buildCspPolicy(env),
          },
          injectTo: 'head-prepend',
        },
      ];
    },
  };
}

