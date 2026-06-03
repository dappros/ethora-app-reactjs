import { Dialog, DialogPanel } from '@headlessui/react';
import { useState } from 'react';
import { IconClose } from '../components/Icons/IconClose';
import { IconExternalLink } from '../components/Icons/IconExternalLink';
import { HubspotForm } from '../components/modal/SettingsTutorialModal/components/HubspotForm';

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

function BookACallModal({ onClose }: { onClose: () => void }) {
  const hubspotConfigured =
    String(import.meta.env.VITE_HUBSPOT_ENABLED || '').toLowerCase() ===
      'true' &&
    !!String(import.meta.env.VITE_HUBSPOT_PORTAL_ID || '').trim() &&
    !!String(import.meta.env.VITE_HUBSPOT_FORM_ID_TUTORIAL || '').trim();

  return (
    <Dialog
      className="fixed inset-0 z-50 flex justify-center items-center bg-black/50"
      open={true}
      onClose={onClose}
    >
      <DialogPanel className="relative bg-white rounded-3xl m-8 p-6 md:p-8 w-[90%] md:w-[560px] max-h-[90vh] overflow-y-auto">
        <button
          className="absolute top-[20px] right-[20px]"
          onClick={onClose}
          aria-label="Close"
        >
          <IconClose />
        </button>
        <div className="font-varela text-[20px] md:text-[24px] mb-4 pr-8">
          Book a call
        </div>
        {hubspotConfigured ? (
          <HubspotForm />
        ) : (
          <div className="font-sans text-sm text-gray-700">
            <p className="mb-4">
              Online booking isn't configured on this install yet. In the
              meantime, drop us a line and we'll get back to you to schedule
              a call.
            </p>
            <a
              href="mailto:hello@ethora.com?subject=Book%20a%20call%20with%20the%20Ethora%20team"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500 text-white hover:bg-brand-darker font-sans text-sm"
            >
              Email hello@ethora.com
            </a>
          </div>
        )}
      </DialogPanel>
    </Dialog>
  );
}

export default function Help() {
  const [showBookACall, setShowBookACall] = useState(false);

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
              'Integrating Ethora into your existing apps or building a new web/mobile app? Check out our SDK monorepo on GitHub — it contains the chat component, backend integration helpers, and ready-to-run examples.'
            }
            href="https://github.com/dappros/ethora/"
            ctaLabel="Open SDK on GitHub"
          />
          <ResourceCard
            title="MCP"
            description={
              'Use our MCP server with your AI IDE — it has knowledge of all Ethora features, tools, and APIs. Just tell your AI IDE what you want to build and it will use the Ethora MCP to set up your project.'
            }
            href="https://github.com/dappros/ethora-mcp-server"
            ctaLabel="Open MCP on GitHub"
          />
          <ResourceCard
            title="Forum"
            description={
              'Have technical or product questions? Create a topic in our community forum — the team and other developers reply there.'
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
        </div>
      </div>
      {showBookACall && (
        <BookACallModal onClose={() => setShowBookACall(false)} />
      )}
    </div>
  );
}
