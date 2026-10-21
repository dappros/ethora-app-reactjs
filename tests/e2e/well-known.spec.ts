import { expect, test } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  buildWellKnownFiles,
  normalizeSha256Fingerprint,
} from '../../vite-plugin-well-known';

// Universal links / app links for the scheduled-call join link
// (https://<host>/call/<slug>): the two /.well-known files, built from config.
// No browser needed: pure builder, the container entrypoint's renderer, and
// the dev server's middleware.

const FP_A =
  'AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99';
const FP_B_BARE = '0123456789abcdef'.repeat(4);
const FP_B = Array(4).fill('01:23:45:67:89:AB:CD:EF').join(':');

const parse = (body: string) => JSON.parse(body);

test.describe('buildWellKnownFiles', () => {
  test('defaults are the production Ethora mobile app', () => {
    const files = buildWellKnownFiles({});
    expect(parse(files.appleAppSiteAssociation)).toEqual({
      applinks: {
        details: [
          {
            appIDs: ['822G3N7CA5.com.ethora.app'],
            components: [{ '/': '/call/*' }],
          },
        ],
      },
    });
  });

  test('assetlinks.json is an empty list until a signing fingerprint is configured', () => {
    expect(parse(buildWellKnownFiles({}).assetLinks)).toEqual([]);
  });

  test('assetlinks.json names the package and the fingerprints once configured', () => {
    const files = buildWellKnownFiles({
      VITE_ANDROID_SHA256_FINGERPRINTS: `${FP_A}, ${FP_B_BARE}`,
    });
    expect(parse(files.assetLinks)).toEqual([
      {
        relation: ['delegate_permission/common.handle_all_urls'],
        target: {
          namespace: 'android_app',
          package_name: 'com.ethora.mobile',
          sha256_cert_fingerprints: [FP_A, normalizeSha256Fingerprint(FP_B_BARE)],
        },
      },
    ]);
  });

  test('team id, bundle ids and package can be overridden; lists are de-duplicated', () => {
    const files = buildWellKnownFiles({
      VITE_APPLE_TEAM_ID: 'abcde12345',
      VITE_IOS_BUNDLE_IDS: 'com.acme.chat, com.acme.chat.beta,com.acme.chat',
      VITE_ANDROID_PACKAGE: 'com.acme.chat',
      VITE_ANDROID_SHA256_FINGERPRINTS: FP_A,
    });
    expect(parse(files.appleAppSiteAssociation).applinks.details[0].appIDs).toEqual([
      'ABCDE12345.com.acme.chat',
      'ABCDE12345.com.acme.chat.beta',
    ]);
    expect(parse(files.assetLinks)[0].target.package_name).toBe('com.acme.chat');
  });

  test('an empty value falls back to the default, like the runtime config does', () => {
    const files = buildWellKnownFiles({ VITE_APPLE_TEAM_ID: '', VITE_IOS_BUNDLE_IDS: '  ' });
    expect(parse(files.appleAppSiteAssociation).applinks.details[0].appIDs).toEqual([
      '822G3N7CA5.com.ethora.app',
    ]);
  });

  test('malformed identifiers are dropped, never published', () => {
    const none = buildWellKnownFiles({
      VITE_APPLE_TEAM_ID: 'short',
      VITE_ANDROID_PACKAGE: 'not a package',
      VITE_ANDROID_SHA256_FINGERPRINTS: FP_A,
    });
    expect(parse(none.appleAppSiteAssociation).applinks.details).toEqual([]);
    expect(parse(none.assetLinks)).toEqual([]);

    const files = buildWellKnownFiles({
      VITE_IOS_BUNDLE_IDS: 'com.ok.app, bad id!, "quoted"',
      VITE_ANDROID_SHA256_FINGERPRINTS: `nope, 12:34, ${FP_A}`,
    });
    expect(parse(files.appleAppSiteAssociation).applinks.details[0].appIDs).toEqual([
      '822G3N7CA5.com.ok.app',
    ]);
    expect(parse(files.assetLinks)[0].target.sha256_cert_fingerprints).toEqual([FP_A]);
  });

  test('fingerprints are normalised to upper-case colon-separated pairs', () => {
    expect(normalizeSha256Fingerprint(FP_B_BARE)).toBe(FP_B);
    expect(normalizeSha256Fingerprint(FP_A.toLowerCase())).toBe(FP_A);
    expect(normalizeSha256Fingerprint('abc')).toBeNull();
  });
});

test.describe('container entrypoint renders the same files', () => {
  const render = (env: Record<string, string>) => {
    const dir = mkdtempSync(join(tmpdir(), 'ethora-wk-'));
    writeFileSync(join(dir, 'index.html'), '<html></html>');
    writeFileSync(join(dir, 'config.js'), '');
    execFileSync('sh', ['docker/entrypoint.sh', 'render', dir], {
      env: { PATH: process.env.PATH ?? '', HTML_DIR: dir, ...env },
      stdio: 'pipe',
    });
    return {
      apple: readFileSync(join(dir, '.well-known/apple-app-site-association'), 'utf8'),
      assetlinks: readFileSync(join(dir, '.well-known/assetlinks.json'), 'utf8'),
    };
  };

  const cases: Array<[string, Record<string, string>]> = [
    ['defaults', {}],
    [
      'overrides with fingerprints',
      {
        VITE_APPLE_TEAM_ID: 'abcde12345',
        VITE_IOS_BUNDLE_IDS: 'com.acme.chat, com.acme.chat.beta,com.acme.chat',
        VITE_ANDROID_PACKAGE: 'com.acme.chat',
        VITE_ANDROID_SHA256_FINGERPRINTS: `${FP_A}, ${FP_B_BARE}, junk`,
      },
    ],
    ['malformed values', { VITE_APPLE_TEAM_ID: 'short', VITE_ANDROID_PACKAGE: 'x y' }],
    ['empty values', { VITE_APPLE_TEAM_ID: '', VITE_IOS_BUNDLE_IDS: '' }],
  ];

  for (const [name, env] of cases) {
    test(`matches the build-time builder: ${name}`, () => {
      const shell = render(env);
      const built = buildWellKnownFiles(env);
      expect(parse(shell.apple)).toEqual(parse(built.appleAppSiteAssociation));
      expect(parse(shell.assetlinks)).toEqual(parse(built.assetLinks));
    });
  }
});

test.describe('dev server', () => {
  test('serves both files as JSON, not as the SPA shell', async ({ request }) => {
    const apple = await request.get('/.well-known/apple-app-site-association');
    expect(apple.status()).toBe(200);
    expect(apple.headers()['content-type']).toContain('application/json');
    expect(await apple.json()).toHaveProperty('applinks.details');

    const android = await request.get('/.well-known/assetlinks.json');
    expect(android.status()).toBe(200);
    expect(android.headers()['content-type']).toContain('application/json');
    expect(Array.isArray(await android.json())).toBe(true);
  });
});
