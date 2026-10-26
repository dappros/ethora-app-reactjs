import type { Plugin } from 'vite';

// Universal links / app links for the scheduled-call join link
// (https://<web host>/call/<slug>), so the installed mobile app opens it
// instead of the browser:
//
//   /.well-known/apple-app-site-association   iOS (extension-less, JSON)
//   /.well-known/assetlinks.json              Android
//
// Both cover only `/call/*`. The identifiers come from the environment:
//
//   VITE_APPLE_TEAM_ID                 default 822G3N7CA5
//   VITE_IOS_BUNDLE_IDS                comma list, default com.ethora.app
//   VITE_ANDROID_PACKAGE               default com.ethora.mobile
//   VITE_ANDROID_SHA256_FINGERPRINTS   comma list of the signing certificate
//                                      SHA-256 (Play app signing key), default
//                                      empty: with none, assetlinks.json is `[]`
//                                      and Android keeps opening the browser
//
// The defaults are the production Ethora mobile app. A source-mode build bakes
// the values in (this plugin); the container image renders the same two files
// again at start-up from its runtime environment (docker/entrypoint.sh keeps
// the same rules, tests/e2e/well-known.spec.ts checks the two agree).

export const WELL_KNOWN_DEFAULTS = {
  appleTeamId: '822G3N7CA5',
  iosBundleIds: 'com.ethora.app',
  androidPackage: 'com.ethora.mobile',
  androidFingerprints: '',
} as const;

/** The path pattern the mobile app claims. */
export const LINK_PATH_PATTERN = '/call/*';

const splitList = (value: string | undefined): string[] =>
  String(value ?? '')
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);

const unique = <T,>(values: T[]): T[] => [...new Set(values)];

// An Apple team id is 10 upper-case letters and digits; a bundle id is a
// reverse-DNS name. Anything else is dropped rather than published.
const TEAM_ID_RE = /^[A-Z0-9]{10}$/;
const BUNDLE_ID_RE = /^[A-Za-z0-9][A-Za-z0-9.-]*$/;
const ANDROID_PACKAGE_RE = /^[A-Za-z][A-Za-z0-9_]*(\.[A-Za-z][A-Za-z0-9_]*)+$/;

/** `AA:BB:..` (32 pairs, upper case) from a colon-separated or bare 64-hex string, else null. */
export function normalizeSha256Fingerprint(value: string): string | null {
  const hex = value.trim().replace(/:/g, '').toUpperCase();
  if (!/^[0-9A-F]{64}$/.test(hex)) return null;
  return hex.match(/.{2}/g)!.join(':');
}

export interface WellKnownFiles {
  /** Body of /.well-known/apple-app-site-association. */
  appleAppSiteAssociation: string;
  /** Body of /.well-known/assetlinks.json. */
  assetLinks: string;
}

const pick = (value: string | undefined, fallback: string): string =>
  value === undefined || value.trim() === '' ? fallback : value;

export function buildWellKnownFiles(env: Record<string, string | undefined>): WellKnownFiles {
  const teamId = pick(env.VITE_APPLE_TEAM_ID, WELL_KNOWN_DEFAULTS.appleTeamId).trim().toUpperCase();
  const bundleIds = unique(
    splitList(pick(env.VITE_IOS_BUNDLE_IDS, WELL_KNOWN_DEFAULTS.iosBundleIds)).filter((id) =>
      BUNDLE_ID_RE.test(id)
    )
  );
  const appIds = TEAM_ID_RE.test(teamId) ? bundleIds.map((id) => `${teamId}.${id}`) : [];

  const apple = {
    applinks: {
      details: appIds.length
        ? [{ appIDs: appIds, components: [{ '/': LINK_PATH_PATTERN }] }]
        : [],
    },
  };

  const androidPackage = pick(env.VITE_ANDROID_PACKAGE, WELL_KNOWN_DEFAULTS.androidPackage).trim();
  const fingerprints = unique(
    splitList(pick(env.VITE_ANDROID_SHA256_FINGERPRINTS, WELL_KNOWN_DEFAULTS.androidFingerprints))
      .map(normalizeSha256Fingerprint)
      .filter((f): f is string => f !== null)
  );
  const links =
    ANDROID_PACKAGE_RE.test(androidPackage) && fingerprints.length
      ? [
          {
            relation: ['delegate_permission/common.handle_all_urls'],
            target: {
              namespace: 'android_app',
              package_name: androidPackage,
              sha256_cert_fingerprints: fingerprints,
            },
          },
        ]
      : [];

  return {
    appleAppSiteAssociation: JSON.stringify(apple, null, 2) + '\n',
    assetLinks: JSON.stringify(links, null, 2) + '\n',
  };
}

const FILES = {
  '.well-known/apple-app-site-association': 'appleAppSiteAssociation',
  '.well-known/assetlinks.json': 'assetLinks',
} as const;

export function wellKnownPlugin(env: Record<string, string | undefined>): Plugin {
  return {
    name: 'ethora-well-known',
    // Dev server and `vite preview`: serve the files with a JSON type (the
    // extension-less one would otherwise fall through to index.html).
    configureServer(server) {
      server.middlewares.use(serve(env));
    },
    configurePreviewServer(server) {
      server.middlewares.use(serve(env));
    },
    // Build: ship the files in dist/. The container image overwrites them at
    // start-up from its runtime environment.
    generateBundle() {
      const files = buildWellKnownFiles(env);
      for (const [fileName, key] of Object.entries(FILES)) {
        this.emitFile({ type: 'asset', fileName, source: files[key] });
      }
    },
  };
}

function serve(env: Record<string, string | undefined>) {
  return (
    req: { url?: string },
    res: {
      setHeader(name: string, value: string): void;
      end(body: string): void;
    },
    next: () => void
  ) => {
    const path = String(req.url || '').split('?')[0];
    const key = (FILES as Record<string, keyof WellKnownFiles>)[path.replace(/^\//, '')];
    if (!key) return next();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store');
    res.end(buildWellKnownFiles(env)[key]);
  };
}
