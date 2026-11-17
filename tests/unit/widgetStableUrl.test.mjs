// The embed snippet must hand out a widget URL that survives later builds,
// and the image's web server must answer old hashed names with the current
// bundle (sites embedded /widget/assistant-<hash>.js from earlier builds).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../..');

test('copy-widget writes the stable assistant.js and the snippet path uses it', () => {
  execFileSync(process.execPath, ['scripts/copy-widget.mjs'], { cwd: root, stdio: 'pipe' });
  const gen = readFileSync(resolve(root, 'src/generated/bundledWidget.ts'), 'utf8');
  const stable = gen.match(/BUNDLED_WIDGET_PATH = '([^']*)'/)?.[1];
  const hashed = gen.match(/BUNDLED_WIDGET_HASHED_PATH = '([^']*)'/)?.[1];
  if (stable === '') return; // AI disabled (deploy stub): no widget shipped.
  assert.equal(stable, '/widget/assistant.js');
  assert.match(hashed, /^\/widget\/assistant-[0-9a-f]{8}\.js$/);
  const a = readFileSync(resolve(root, 'public', stable.slice(1)));
  const b = readFileSync(resolve(root, 'public', hashed.slice(1)));
  assert.ok(a.equals(b), 'stable and hashed copies are the same bundle');
});

test('image nginx answers any /widget/assistant-<hash>.js with the stable bundle, short cache', () => {
  const conf = readFileSync(resolve(root, 'docker/nginx.conf'), 'utf8');
  const block = conf.match(/location ~ \^\/widget\/assistant[^{]*\{([^}]*)\}/);
  assert.ok(block, 'widget location present');
  assert.match(block[1], /try_files \$uri \/widget\/assistant\.js =404;/);
  assert.match(block[1], /max-age=300/);
  assert.ok(conf.indexOf('location ~ ^/widget/assistant') < conf.indexOf('location / {'));
  assert.ok(existsSync(resolve(root, 'scripts/copy-widget.mjs')));
});
