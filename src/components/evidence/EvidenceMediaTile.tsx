// Ethora.com platform, copyright: Dappros Ltd (c) 2026, all rights reserved
//
// One kept media file of an evidence case. The tile starts with no image:
// the signal summary and the AI description (section 14) come first. Nothing
// is fetched until the reviewer presses Show and confirms the warning (the
// parent owns the reveal step, so "Show all" works too): each fetch is an
// audited view. It then shows greyscale and heavily blurred; "Show clearly"
// is a second step to full colour, "Blur again" goes back. Video stays muted
// and paused until the reviewer plays it. The API
// needs the Authorization header, so the file comes through the
// authenticated client as a blob and is shown from an object URL, which is
// revoked when it is replaced or the tile unmounts. The preview object is
// used for the thumbnail when the API has one; "Open original" fetches the
// original into a viewer.
import { Dialog, DialogPanel } from '@headlessui/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { httpGetEvidenceMedia, saveBlobAs } from '../../http';
import { useTranslation } from '../../i18n/useTranslation';
import type { EvidenceMedia } from '../../models';
import { formatBytes, mediaKind } from '../../utils/evidence';
import type { RevealStep } from '../../utils/mediaSignals';
import { IconClose } from '../Icons/IconClose';
import { MediaSignalSummary, RevealControls, SaferMediaElement } from '../TrustSafety/SaferMedia';

interface Loaded {
  url: string;
  type: string;
  blob: Blob;
}

// Fetches a media object into an object URL; revokes the previous one on
// replace and the current one on unmount.
function useEvidenceBlob() {
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const current = useRef<string | null>(null);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      if (current.current) URL.revokeObjectURL(current.current);
      current.current = null;
    };
  }, []);

  const load = useCallback(async (evidenceId: string, preview: boolean, fallbackType?: string | null) => {
    setLoading(true);
    setFailed(false);
    try {
      const r = await httpGetEvidenceMedia(evidenceId, preview);
      const raw = r.data;
      const type = raw.type || String(r.headers?.['content-type'] || '') || fallbackType || 'application/octet-stream';
      const blob = raw.type ? raw : new Blob([raw], { type });
      if (!alive.current) return;
      const url = URL.createObjectURL(blob);
      if (current.current) URL.revokeObjectURL(current.current);
      current.current = url;
      setLoaded({ url, type: blob.type || type, blob });
    } catch {
      if (alive.current) setFailed(true);
    } finally {
      if (alive.current) setLoading(false);
    }
  }, []);

  return { loaded, loading, failed, load };
}

function Inline({ loaded, name, step = 'clear', fill }: { loaded: Loaded; name: string; step?: RevealStep; fill?: boolean }) {
  const { t } = useTranslation();
  return (
    <SaferMediaElement
      src={loaded.url}
      kind={mediaKind(loaded.type)}
      step={step}
      name={name}
      fill={fill}
      fallback={<div className="p-2 text-xs text-gray-500 text-center">{t('evidence.media.noInline')}</div>}
    />
  );
}

function OriginalViewer({ item, onClose }: { item: EvidenceMedia; onClose: () => void }) {
  const { t } = useTranslation();
  const { loaded, loading, failed, load } = useEvidenceBlob();
  const name = item.originalName || item.fileId || item.evidenceId;

  useEffect(() => {
    void load(item.evidenceId, false, item.mimetype);
  }, [item.evidenceId, item.mimetype, load]);

  return (
    <Dialog className="relative z-50" open onClose={onClose}>
      <div className="fixed inset-0 bg-black/60" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-[960px] max-h-full overflow-y-auto rounded-2xl bg-white p-4 shadow-xl">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="min-w-0 font-sans text-sm break-all">{name}</div>
            <button type="button" onClick={onClose} aria-label={t('evidence.media.close')}>
              <IconClose />
            </button>
          </div>
          <div className="flex min-h-[200px] items-center justify-center rounded-xl bg-gray-100 overflow-hidden">
            {loading && <span className="text-sm text-gray-500">{t('evidence.media.loading')}</span>}
            {failed && <span className="text-sm text-red-600 dark:text-red-400">{t('evidence.media.loadFailed')}</span>}
            {loaded && !loading && <Inline loaded={loaded} name={name} />}
          </div>
          {loaded && (
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                className="rounded-xl border border-gray-300 px-3 py-1.5 text-sm"
                onClick={() => saveBlobAs(loaded.blob, item.originalName || `${item.evidenceId}`)}
              >
                {t('evidence.media.download')}
              </button>
            </div>
          )}
        </DialogPanel>
      </div>
    </Dialog>
  );
}

interface Props {
  item: EvidenceMedia;
  step: RevealStep;
  onShow: () => void;
  onShowClearly: () => void;
  onBlurAgain: () => void;
  onHide: () => void;
}

export function EvidenceMediaTile({ item, step, onShow, onShowClearly, onBlurAgain, onHide }: Props) {
  const { t } = useTranslation();
  const { loaded, loading, failed, load } = useEvidenceBlob();
  const [viewer, setViewer] = useState(false);
  const name = item.originalName || item.fileId || item.evidenceId;
  const usePreview = Boolean(item.hasPreview);
  const shown = step !== 'hidden';

  // First Show fetches; a later Hide keeps the object so Show again is instant.
  useEffect(() => {
    if (shown && !loaded && !loading && !failed) void load(item.evidenceId, usePreview, item.mimetype);
  }, [shown, loaded, loading, failed, load, item.evidenceId, item.mimetype, usePreview]);

  const meta = [item.mimetype, formatBytes(item.size)].filter(Boolean).join(', ');

  return (
    <div className="flex w-[220px] flex-col gap-2 min-w-0">
      <MediaSignalSummary moderation={item.moderation} />
      {shown && (
        <div className="relative h-[160px] w-[220px] overflow-hidden rounded-xl bg-gray-100 flex items-center justify-center">
          {loaded ? (
            <Inline loaded={loaded} name={name} step={step} fill />
          ) : (
            <span className="relative text-xs text-gray-600 px-2 text-center">
              {loading ? t('evidence.media.loading') : failed ? t('evidence.media.loadFailed') : ''}
            </span>
          )}
        </div>
      )}
      <div className="min-w-0 text-xs">
        <div className="truncate text-gray-800" title={name}>
          {name}
        </div>
        {meta && <div className="text-gray-500 truncate">{meta}</div>}
        {step === 'muted' && loaded && <div className="text-gray-500">{t('tsReveal.mutedHint')}</div>}
      </div>
      <div className="flex flex-wrap gap-2 text-xs">
        <RevealControls step={step} onShow={onShow} onShowClearly={onShowClearly} onBlurAgain={onBlurAgain} onHide={onHide} />
        {shown && failed && (
          <button
            type="button"
            className="text-brand-500 underline"
            onClick={() => void load(item.evidenceId, usePreview, item.mimetype)}
          >
            {t('evidence.media.retry')}
          </button>
        )}
        {step === 'clear' && (
          <button type="button" className="text-brand-500 underline" onClick={() => setViewer(true)}>
            {t('evidence.media.openOriginal')}
          </button>
        )}
      </div>
      {viewer && <OriginalViewer item={item} onClose={() => setViewer(false)} />}
    </div>
  );
}
