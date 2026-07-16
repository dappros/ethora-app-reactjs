import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconExternalLink } from '../components/Icons/IconExternalLink';
import { BookACallModal } from '../components/modal/BookACallModal';
import { useWhatsNew } from '../hooks/useWhatsNew';
import { useTranslation } from '../i18n/useTranslation';
import { LATEST_VERSION } from '../whatsNew/releases';

// Derive the uptime/status page URL from the current hostname.
// Convention: the uptime service is hosted on a sibling subdomain to the
// admin frontend, with the leading "app" label swapped for "uptime"
// (e.g. app.chat-qa.ethora.com -> uptime.chat-qa.ethora.com). If the
// hostname doesn't start with "app." we prepend "uptime." which still
// produces a sensible default for enterprise/self-hosted installs.
function deriveStatusUrl(): string {
  if (typeof window === 'undefined') return '';
  const host = window.location.hostname;
  if (!host || host === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(host)) {
    return '';
  }
  const parts = host.split('.');
  if (parts[0] === 'app') {
    parts[0] = 'uptime';
  } else {
    parts.unshift('uptime');
  }
  return `https://${parts.join('.')}/`;
}

interface ResourceCardProps {
  title: string;
  description: string;
  href?: string;
  onClick?: () => void;
  ctaLabel: string;
  external?: boolean;
}

function ResourceCard({
  title,
  description,
  href,
  onClick,
  ctaLabel,
  external = true,
}: ResourceCardProps) {
  const ctaClass =
    'inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-brand-500 text-brand-500 hover:bg-brand-hover font-sans text-sm';
  return (
    <div className="rounded-2xl bg-white p-6 flex flex-col h-full">
      <div className="font-varela text-[20px] md:text-[24px] leading-tight mb-2">
        {title}
      </div>
      <div className="font-sans text-sm text-gray-600 mb-4 whitespace-pre-line">
        {description}
      </div>
      <div className="mt-auto">
        {href ? (
          <a
            href={href}
            target={external ? '_blank' : undefined}
            rel={external ? 'noopener noreferrer' : undefined}
            className={ctaClass}
          >
            {ctaLabel}
            {external && <IconExternalLink width={14} height={14} />}
          </a>
        ) : (
          <button type="button" onClick={onClick} className={ctaClass}>
            {ctaLabel}
          </button>
        )}
      </div>
    </div>
  );
}

export default function Help() {
  const [showBookACall, setShowBookACall] = useState(false);
  const statusUrl = useMemo(deriveStatusUrl, []);
  const navigate = useNavigate();
  const { hasUnseen } = useWhatsNew();
  const { t } = useTranslation();

  return (
    <div className="grid grid-rows-[auto,_1fr] gap-4 h-full">
      <div className="md:px-8 hidden md:flex flex-col justify-between items-stretch md:items-center md:flex-row md:min-h-[40px]">
        <div className="font-varela mb-4 text-[24px] md:mb-0 md:text-[34px] leading-none">
          {t('help.title')}
        </div>
      </div>
      <div className="rounded-2xl bg-gray-50 p-4 md:p-6 overflow-y-auto">
        <div className="font-sans text-base text-gray-700 mb-6 max-w-3xl">
          {t('help.subtitle')}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl">
          <ResourceCard
            title={
              hasUnseen
                ? t('help.whatsNew.titleWithVersion').replace(
                    '{version}',
                    LATEST_VERSION
                  )
                : t('help.whatsNew.title')
            }
            description={t('help.whatsNew.description')}
            onClick={() => navigate('/app/help/whats-new')}
            ctaLabel={t('help.whatsNew.cta')}
          />
          <ResourceCard
            title={t('help.sdk.title')}
            description={t('help.sdk.description')}
            href="https://github.com/dappros/ethora/"
            ctaLabel={t('help.sdk.cta')}
          />
          <ResourceCard
            title={t('help.mcp.title')}
            description={t('help.mcp.description')}
            href="https://github.com/dappros/ethora-mcp-server"
            ctaLabel={t('help.mcp.cta')}
          />
          <ResourceCard
            title={t('help.forum.title')}
            description={t('help.forum.description')}
            href="https://forum.ethora.com/"
            ctaLabel={t('help.forum.cta')}
          />
          <ResourceCard
            title={t('help.bookACall.title')}
            description={t('help.bookACall.description')}
            ctaLabel={t('help.bookACall.cta')}
            onClick={() => setShowBookACall(true)}
          />
          {statusUrl && (
            <ResourceCard
              title={t('help.status.title')}
              description={t('help.status.description')}
              href={statusUrl}
              ctaLabel={t('help.status.cta')}
            />
          )}
        </div>
      </div>
      {showBookACall && (
        <BookACallModal onClose={() => setShowBookACall(false)} />
      )}
    </div>
  );
}
