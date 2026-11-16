// Ethora.com platform, copyright: Dappros Ltd (c) 2026, all rights reserved
//
// T&S hub (docs/TRUST_AND_SAFETY.md section 13): one superadmin area for
// Trust & Safety at /app/admin/trust-safety, with the tab in the URL
// (?tab=overview | quarantine | moderation | suspended | rules | domains |
// ipBlocks | settings). A quarantine case opens under the Quarantine tab at
// /app/admin/trust-safety/quarantine/:caseId. Old /app/admin/evidence URLs
// redirect here (see LegacyEvidenceRedirect). Superadmins with write access
// only; the APIs enforce the same rule and audit every call.
import cn from 'classnames';
import type { ReactNode } from 'react';
import { Navigate, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { EvidenceNotAllowed } from '../components/evidence/EvidenceAccess';
import { useCanReviewEvidence } from '../components/evidence/hooks';
import { BlockedDomainsTab } from '../components/TrustSafety/hub/BlockedDomainsTab';
import { IpBlocksTab } from '../components/TrustSafety/hub/IpBlocksTab';
import { ModerationTab } from '../components/TrustSafety/hub/ModerationTab';
import { OverviewTab } from '../components/TrustSafety/hub/OverviewTab';
import { QuarantineTab } from '../components/TrustSafety/hub/QuarantineTab';
import { RulesTab } from '../components/TrustSafety/hub/RulesTab';
import { SuspendedUsersTab } from '../components/TrustSafety/hub/SuspendedUsersTab';
import { TabHeader } from '../components/TrustSafety/hub/common';
import { TrustSafetySettingsPanel } from '../components/TrustSafety/TrustSafetySettingsPanel';
import { useTranslation } from '../i18n/useTranslation';
import { TS_HUB_TABS, TsHubTab, hubTabFromParams, hubTabPath, legacyEvidenceRedirect } from '../utils/tsHub';
import AdminQuarantineCase from './AdminQuarantineCase';

function HubShell({ active, children }: { active: TsHubTab | null; children: ReactNode }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] grid-rows-[auto,_1fr] gap-4 h-full min-w-0">
      <div className="md:px-8 hidden md:flex flex-col justify-between items-stretch md:items-center md:flex-row md:min-h-[40px] gap-4">
        <div className="font-varela mb-4 text-[24px] md:mb-0 md:text-[34px] leading-none">{t('tsHub.title')}</div>
      </div>
      <div className="rounded-2xl bg-white p-4 md:p-8 overflow-y-auto min-w-0">
        {active && (
          <div role="tablist" aria-label={t('tsHub.title')} className="mb-6 -mx-1 flex gap-1 overflow-x-auto border-b border-gray-200">
            {TS_HUB_TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={tab === active}
                onClick={() => navigate(hubTabPath(tab))}
                className={cn(
                  'relative shrink-0 whitespace-nowrap px-3 py-2 text-sm font-sans border-b-2 -mb-px',
                  tab === active ? 'border-brand-500 text-brand-500 font-semibold' : 'border-transparent text-gray-600 hover:text-gray-900'
                )}
              >
                {t(`tsHub.tab.${tab}`)}
              </button>
            ))}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

export default function AdminTrustSafety() {
  const allowed = useCanReviewEvidence();
  const [searchParams] = useSearchParams();
  const { caseId } = useParams();
  const { t } = useTranslation();

  if (!allowed) {
    return (
      <HubShell active={null}>
        <EvidenceNotAllowed />
      </HubShell>
    );
  }

  if (caseId) {
    return (
      <HubShell active="quarantine">
        <AdminQuarantineCase />
      </HubShell>
    );
  }

  const tab = hubTabFromParams(searchParams);
  return (
    <HubShell active={tab}>
      {/* Each tab mounts only while open, so only its requests are sent (and audited). */}
      {tab === 'overview' && <OverviewTab />}
      {tab === 'quarantine' && <QuarantineTab />}
      {tab === 'moderation' && <ModerationTab />}
      {tab === 'suspended' && <SuspendedUsersTab />}
      {tab === 'rules' && <RulesTab />}
      {tab === 'domains' && <BlockedDomainsTab />}
      {tab === 'ipBlocks' && <IpBlocksTab />}
      {tab === 'settings' && (
        <>
          <TabHeader title={t('tsHub.tab.settings')} intro={t('tsHub.settings.intro')} />
          <TrustSafetySettingsPanel />
        </>
      )}
    </HubShell>
  );
}

/**
 * Old Evidence URLs: /app/admin/evidence(?filters) opens the Quarantine tab
 * with the same filters, /app/admin/evidence/:caseId the case view.
 */
export function LegacyEvidenceRedirect() {
  const { caseId } = useParams();
  const location = useLocation();
  return <Navigate to={legacyEvidenceRedirect(caseId, location.search)} replace />;
}

/** /app/admin/trust-safety/quarantine without a case: the Quarantine tab. */
export function QuarantineIndexRedirect() {
  const location = useLocation();
  return <Navigate to={legacyEvidenceRedirect(undefined, location.search)} replace />;
}
