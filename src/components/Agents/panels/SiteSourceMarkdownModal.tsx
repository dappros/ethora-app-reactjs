import { Dialog, DialogPanel } from '@headlessui/react';
import { useEffect, useState } from 'react';
import { useTranslation } from '../../../i18n/useTranslation';
import { httpGetSiteSourceV2 } from '../../../http';
import { CopyButton } from '../../CopyButton';
import { IconClose } from '../../Icons/IconClose';

interface Props {
  appId: string;
  sourceId: string;
  // Shown in the header immediately, so the dialog has a title before the
  // fetch lands. The response carries the same URL and wins once it arrives.
  url: string;
  onClose: () => void;
}

// Reads back the markdown a crawl stored for one URL. Rendered as source text
// rather than as formatted HTML on purpose: this is the exact string that gets
// chunked and embedded, so what an operator needs to see is what the crawler
// extracted (missing sections, nav boilerplate, empty pages), not a tidy
// re-rendering of it.
export function SiteSourceMarkdownModal({ appId, sourceId, url, onClose }: Props) {
  const { t } = useTranslation();
  const [md, setMd] = useState('');
  const [bytes, setBytes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    httpGetSiteSourceV2(appId, sourceId)
      .then((r) => {
        if (cancelled) return;
        setMd(r.data?.result?.md || '');
        setBytes(Number(r.data?.result?.mdByteSize) || 0);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e?.response?.data?.error || e?.message || '');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    // Closing the dialog mid-request must not write state into a gone component.
    return () => {
      cancelled = true;
    };
  }, [appId, sourceId]);

  return (
    <Dialog open={true} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="bg-white rounded shadow-lg w-full max-w-3xl max-h-[85vh] flex flex-col">
          <div className="flex items-start gap-2 border-b p-3">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium">{t('agentPanels.markdownTitle')}</div>
              <div className="font-mono text-xs text-gray-500 break-all mt-0.5">{url}</div>
            </div>
            {/* Copying the raw source is the point of the dialog, so it stays
                reachable while the body scrolls. */}
            {!loading && !error && md && <CopyButton value={md} />}
            <button onClick={onClose} aria-label={t('agentPanels.closeDialog')} className="p-1">
              <IconClose />
            </button>
          </div>

          <div className="flex-1 overflow-auto p-3">
            {loading && <div className="text-xs text-gray-500">{t('agentPanels.loading')}</div>}
            {!loading && error && (
              <div className="text-xs text-red-600">
                {t('agentPanels.markdownLoadFailedPrefix')} {error}
              </div>
            )}
            {!loading && !error && !md && (
              <div className="text-xs text-gray-500">{t('agentPanels.markdownEmpty')}</div>
            )}
            {!loading && !error && md && (
              <pre className="text-xs font-mono whitespace-pre-wrap break-words">{md}</pre>
            )}
          </div>

          {!loading && !error && md && (
            <div className="border-t p-2 text-xs text-gray-500">
              {t('agentPanels.markdownBytes').replace('{n}', bytes.toLocaleString())}
            </div>
          )}
        </DialogPanel>
      </div>
    </Dialog>
  );
}
