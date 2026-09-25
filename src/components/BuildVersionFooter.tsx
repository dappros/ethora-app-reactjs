// Ethora.com platform, copyright: Dappros Ltd (c) 2026, all rights reserved
//
// Tiny build/version footer. Renders one line at the bottom of the auth screen
// (Login / Register / etc.) showing:
//   - Frontend version (yy.mm.dd) + git branch + short commit (compile-time)
//   - Backend  version (yy.mm.dd) + git branch + short commit (fetched at runtime)
//
// Frontend values come from Vite env vars (VITE_BUILD_VERSION / VITE_BUILD_BRANCH /
// VITE_BUILD_COMMIT) which are populated at build time by deploy/scripts/setup-env.sh
// (which derives them from `git log -1` on the deploy source repo). Falls back to
// empty/dev when those vars aren't set (e.g. local `npm run dev` without env).
//
// Backend values are fetched from /v1/ping/version (already exposed by the api).

import { useEffect, useState } from 'react';
import { useTranslation } from '../i18n/useTranslation';

import { fetchBackendVersionOnce } from '../utils/backendVersion';

function shortCommit(c?: string | null) {
  if (!c) return '';
  return String(c).slice(0, 7);
}

function fmtPart(label: string, version: string, branch?: string | null, commit?: string | null) {
  // Compact format: "f/e 26.04.21 (feat/ai-agents @7814b20)"
  // - Label is short (f/e | b/e) to keep the footer discreet.
  // - Branch + commit inside parens; commit shown without a space after '@' to save pixels.
  const parts: string[] = [label];
  if (version) parts.push(version);
  const tail: string[] = [];
  if (branch) tail.push(branch);
  if (commit) tail.push(`@${shortCommit(commit)}`);
  if (tail.length) parts.push(`(${tail.join(' ')})`);
  return parts.join(' ');
}

export const BuildVersionFooter: React.FC = () => {
  const { t } = useTranslation();
  const [be, setBe] = useState<BackendVersionInfo | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchBackendVersionOnce()
      .then((data) => {
        if (cancelled || !data) return;
        setBe(data);
      })
      .catch(() => {
        // Silent: missing version info is not actionable on the login screen.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // If we have no info at all (no FE env vars + backend offline), render nothing
  // rather than show "frontend (none) · backend (none)".
  const hasFe = !!(FE_VERSION || FE_BRANCH || FE_COMMIT);
  const hasBe = !!(be && (be.version || be.build?.version || be.build?.commit));
  if (!hasFe && !hasBe) return null;

  const fePart = hasFe ? fmtPart('f/e', FE_VERSION, FE_BRANCH, FE_COMMIT) : '';
  const beVer = be?.build?.version || be?.version || '';
  const bePart = hasBe ? fmtPart('b/e', beVer, be?.build?.branch || null, be?.build?.commit || null) : '';

  return (
    <div
      style={{
        textAlign: 'center',
        fontSize: '11px',
        color: '#9aa0a6',
        fontFamily:
          'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
        padding: '8px 12px 4px',
        userSelect: 'all',
      }}
      title={t('buildVersionFooter.tooltip')}
    >
      {[fePart, bePart].filter(Boolean).join(' | ')}
    </div>
  );
};

export default BuildVersionFooter;
