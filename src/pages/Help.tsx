import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconExternalLink } from '../components/Icons/IconExternalLink';
import { BookACallModal } from '../components/modal/BookACallModal';
import { SimpleMarkdown } from '../components/SimpleMarkdown';
import { httpGetReleaseNotes, ReleaseNotesEntry } from '../http';
import { useTranslation } from '../i18n/useTranslation';

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
  // Optional second, quieter action (always an external link).
  secondaryHref?: string;
  secondaryLabel?: string;
}

function ResourceCard({
  title,
  description,
  href,
  onClick,
  ctaLabel,
  external = true,
  secondaryHref,
  secondaryLabel,
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
        {secondaryHref && secondaryLabel && (
          <a
            href={secondaryHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 ml-4 font-sans text-sm text-gray-500 underline hover:text-brand-500"
          >
            {secondaryLabel}
            <IconExternalLink width={12} height={12} />
          </a>
        )}
      </div>
    </div>
  );
}

export default function Help() {
  const [showBookACall, setShowBookACall] = useState(false);
  const statusUrl = useMemo(deriveStatusUrl, []);
  const navigate = useNavigate();
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
        <ReleaseNotes />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl">
          <ResourceCard
            title={t('help.sdk.title')}
            description={t('help.sdk.description')}
            href="https://github.com/dappros/ethora/"
            ctaLabel={t('help.sdk.cta')}
          />
          {/* Remote MCP is the default: one URL, no install. The CLI (stdio)
              is the second option for people who want it on their machine. */}
          <ResourceCard
            title={t('help.mcp.title')}
            description={t('help.mcp.description')}
            onClick={() => navigate('/app/account?tab=AI%20Assistants')}
            ctaLabel={t('help.mcp.cta')}
            secondaryHref="https://github.com/dappros/ethora-mcp-server#using-with-stdio-clients"
            secondaryLabel={t('help.mcp.cliCta')}
          />
          <ResourceCard
            title={t('help.forum.title')}
            description={t('help.forum.description')}
            href="https://ethora.com/community/"
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

// The latest three weekly release notes, from the API (which fetches the
// public RELEASE-NOTES.md). Hidden while loading and when there are none:
// an install that makes no outbound calls, or GitHub unreachable.
function ReleaseNotes() {
  const { t } = useTranslation();
  const [notes, setNotes] = useState<{ entries: ReleaseNotesEntry[]; url: string } | null>(null);
  useEffect(() => {
    let cancelled = false;
    httpGetReleaseNotes()
      .then(({ data }) => {
        if (!cancelled) setNotes(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);
  if (!notes?.entries?.length) return null;
  return (
    <section className="mb-6 max-w-5xl rounded-2xl border border-gray-200 bg-white p-4 md:p-6" data-testid="release-notes">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-varela text-xl">{t('help.releaseNotes.title')}</h2>
        <a href={notes.url} target="_blank" rel="noopener noreferrer" className="text-sm text-brand-500 underline">
          {t('help.releaseNotes.all')}
        </a>
      </div>
      <p className="mt-1 text-sm text-gray-600">{t('help.releaseNotes.intro')}</p>
      <div className="mt-3 divide-y divide-gray-200">
        {notes.entries.map((e, i) => (
          <details key={e.title} open={i === 0} className="group py-2">
            <summary className="cursor-pointer list-inside font-semibold text-gray-900">{e.title}</summary>
            <div className="mt-2 min-w-0 break-words text-sm text-gray-800">
              {/* Blockquote markers ("> [repo](...)") read as plain lines here. */}
              <SimpleMarkdown text={e.body.replace(/^>\s?/gm, '')} />
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
