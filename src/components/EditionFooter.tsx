// Ethora.com platform, copyright: Dappros Ltd (c) 2026, all rights reserved
//
// "Ethora Core v2610.1 UNREGISTERED" in the corner of the admin shell: the
// edition the install runs as plus the backend build. UNREGISTERED links to
// the License page, where registering (free) lifts the Core caps.
import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useLicenseStatus } from '../hooks/useLicenseStatus';
import { useTranslation } from '../i18n/useTranslation';
import { fetchBackendVersionOnce } from '../utils/backendVersion';

export function EditionFooter({ className }: { className?: string }) {
  const { t } = useTranslation();
  const { status } = useLicenseStatus();
  const [version, setVersion] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    fetchBackendVersionOnce().then((v) => {
      if (cancelled || !v) return;
      setVersion((v.build?.version || v.version || '').trim());
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!status) return null;
  const name =
    status.tier === 'enterprise'
      ? t('edition.enterprise')
      : status.tier === 'trial'
        ? t('edition.trial')
        : t('edition.core');

  return (
    <span className={className} title={t('edition.tooltip')}>
      {name}
      {version ? ` v${version}` : ''}
      {status.tier === 'core' && (
        <>
          {' '}
          <NavLink to="/app/admin/license" className="text-brand-500 underline font-semibold">
            {t('edition.unregistered')}
          </NavLink>
        </>
      )}
    </span>
  );
}

export default EditionFooter;
