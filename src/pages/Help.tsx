import { useMemo, useState } from 'react';
import { IconExternalLink } from '../components/Icons/IconExternalLink';
import { BookACallModal } from '../components/modal/BookACallModal';

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

  return (
    <div className="grid grid-rows-[auto,_1fr] gap-4 h-full">
      <div className="md:px-8 hidden md:flex flex-col justify-between items-stretch md:items-center md:flex-row">
        <div className="font-varela mb-4 text-[24px] md:mb-0 md:text-[34px] leading-none">
          Help &amp; Support
        </div>
      </div>
      <div className="rounded-2xl bg-gray-50 p-4 md:p-6 overflow-y-auto">
        <div className="font-sans text-base text-gray-700 mb-6 max-w-3xl">
          Resources to help you get started and get the most out of Ethora.
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl">
          <ResourceCard
            title="SDK"
            description={
              'Integrating Ethora into your existing apps or building a new web/mobile app? Check out our SDK monorepo on GitHub - it contains the chat component, backend integration helpers, and ready-to-run examples.'
            }
            href="https://github.com/dappros/ethora/"
            ctaLabel="Open SDK on GitHub"
          />
          <ResourceCard
            title="MCP"
            description={
              'Use our MCP server with your AI IDE - it has knowledge of all Ethora features, tools, and APIs. Just tell your AI IDE what you want to build and it will use the Ethora MCP to set up your project.'
            }
            href="https://github.com/dappros/ethora-mcp-server"
            ctaLabel="Open MCP on GitHub"
          />
          <ResourceCard
            title="Forum"
            description={
              'Have technical or product questions? Create a topic in our community forum - the team and other developers reply there.'
            }
            href="https://forum.ethora.com/"
            ctaLabel="Visit the forum"
          />
          <ResourceCard
            title="Book a call"
            description={
              'Get on a call with our product team. We will point you in the right direction so you can leverage Ethora quickly and efficiently.'
            }
            ctaLabel="Book a call"
            onClick={() => setShowBookACall(true)}
          />
          {statusUrl && (
            <ResourceCard
              title="Status"
              description={
                'Live infrastructure health and uptime for this environment - API, XMPP, push, AI and more. Check here first if something looks off.'
              }
              href={statusUrl}
              ctaLabel="Open status page"
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
