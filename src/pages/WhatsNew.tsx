import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { IconExternalLink } from '../components/Icons/IconExternalLink';
import { BookACallModal } from '../components/modal/BookACallModal';
import { useWhatsNew } from '../hooks/useWhatsNew';
import {
  LATEST_BLOG_URL,
  RELEASE_NOTES_URL,
  RELEASES,
  Highlight,
} from '../whatsNew/releases';

function HighlightCard({
  highlight,
  onBookACall,
}: {
  highlight: Highlight;
  onBookACall: () => void;
}) {
  const navigate = useNavigate();
  const ctaClass =
    'inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-brand-500 text-brand-500 hover:bg-brand-hover font-sans text-sm';

  const renderCta = () => {
    if (highlight.deepLink?.kind === 'route') {
      const to = highlight.deepLink.to;
      return (
        <button
          type="button"
          onClick={() => navigate(to)}
          className={ctaClass}
        >
          Open
        </button>
      );
    }
    if (highlight.deepLink?.kind === 'modal' && highlight.deepLink.id === 'book-a-call') {
      return (
        <button type="button" onClick={onBookACall} className={ctaClass}>
          Book a call
        </button>
      );
    }
    if (highlight.externalLink) {
      return (
        <a
          href={highlight.externalLink}
          target="_blank"
          rel="noopener noreferrer"
          className={ctaClass}
        >
          Learn more
          <IconExternalLink width={14} height={14} />
        </a>
      );
    }
    return null;
  };

  return (
    <div className="rounded-2xl bg-white p-6 flex flex-col h-full">
      <div className="font-varela text-[18px] md:text-[20px] leading-tight mb-2">
        {highlight.title}
      </div>
      <div className="font-sans text-sm text-gray-600 mb-4">
        {highlight.description}
      </div>
      <div className="mt-auto">{renderCta()}</div>
    </div>
  );
}

export default function WhatsNew() {
  const { markSeen } = useWhatsNew();
  const [showBookACall, setShowBookACall] = useState(false);

  // Mark the latest version as seen on mount. Idempotent - landing here via
  // a deep link, refresh, or the sidebar all behave the same.
  useEffect(() => {
    markSeen();
  }, [markSeen]);

  return (
    <div className="grid grid-rows-[auto,_1fr] gap-4 h-full">
      <div className="md:px-8 hidden md:flex flex-col justify-between items-stretch md:items-center md:flex-row md:min-h-[40px]">
        <div className="font-varela mb-4 text-[24px] md:mb-0 md:text-[34px] leading-none">
          What's new
        </div>
        <NavLink
          to="/app/help"
          className="font-sans text-sm text-brand-500 hover:underline"
        >
          Back to Help &amp; Support
        </NavLink>
      </div>

      <div className="rounded-2xl bg-gray-50 p-4 md:p-6 overflow-y-auto">
        <div className="font-sans text-base text-gray-700 mb-6 max-w-3xl">
          See what shipped in the latest releases. Each item links into the
          app or to the deeper story.
        </div>

        {RELEASES.map((release) => (
          <section key={release.version} className="mb-8 last:mb-2">
            <div className="flex items-baseline gap-3 mb-4">
              <div className="font-varela text-[20px] md:text-[24px]">
                {release.version}
              </div>
              <div className="font-sans text-sm text-gray-500">
                {release.date}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl">
              {release.highlights.map((h, i) => (
                <HighlightCard
                  key={`${release.version}-${i}`}
                  highlight={h}
                  onBookACall={() => setShowBookACall(true)}
                />
              ))}
            </div>
          </section>
        ))}

        <div className="border-t border-gray-200 pt-4 max-w-5xl">
          <div className="font-sans text-sm text-gray-600 flex flex-wrap gap-x-6 gap-y-2">
            <a
              href={RELEASE_NOTES_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-brand-500 hover:underline"
            >
              Full release notes on GitHub
              <IconExternalLink width={12} height={12} />
            </a>
            <a
              href={LATEST_BLOG_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-brand-500 hover:underline"
            >
              Read more on the blog
              <IconExternalLink width={12} height={12} />
            </a>
          </div>
        </div>
      </div>

      {showBookACall && (
        <BookACallModal onClose={() => setShowBookACall(false)} />
      )}
    </div>
  );
}
