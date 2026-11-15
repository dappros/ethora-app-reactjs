// Ethora.com platform, copyright: Dappros Ltd (c) 2026, all rights reserved
//
// One kept media file of an evidence case. Nothing is fetched until the
// reviewer presses Show and confirms the warning (the parent owns that
// state, so "Show all" works too): each fetch is an audited view. The API
// needs the Authorization header, so the file comes through the
// authenticated client as a blob and is shown from an object URL, which is
// revoked when it is replaced or the tile unmounts. The preview object is
// used for the thumbnail when the API has one; "Open original" fetches the
// original into a viewer.
import { Dialog, DialogPanel } from '@headlessui/react';
import cn from 'classnames';
import { useCallback, useEffect, useRef, useState } from 'react';
import { httpGetEvidenceMedia, saveBlobAs } from '../../http';
import { useTranslation } from '../../i18n/useTranslation';
import type { EvidenceMedia } from '../../models';
import { formatBytes, mediaKind } from '../../utils/evidence';
import { IconClose } from '../Icons/IconClose';

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

function Inline({ loaded, name, blurred, fill }: { loaded: Loaded; name: string; blurred?: boolean; fill?: boolean }) {
  const { t } = useTranslation();
  const kind = mediaKind(loaded.type);
  const blur = blurred ? 'blur-xl scale-110' : '';
  if (kind === 'image') {
    return (
      <img
        src={loaded.url}
        alt={name}
        className={cn('transition', fill ? 'h-full w-full object-cover' : 'max-h-[75vh] max-w-full object-contain', blur)}
      />
    );
  }
  if (kind === 'video') {
    return (
      <video
        src={loaded.url}
        controls={!blurred}
        className={cn('transition', fill ? 'h-full w-full object-cover' : 'max-h-[75vh] max-w-full', blur)}
      />
    );
  }
  if (kind === 'audio') {
    return <audio src={loaded.url} controls className={cn('w-full', blurred && 'opacity-30 pointer-events-none')} />;
  }
  return <div className="p-2 text-xs text-gray-500 text-center">{t('evidence.media.noInline')}</div>;
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
  revealed: boolean;
  onShow: () => void;
  onBlur: () => void;
}

export function EvidenceMediaTile({ item, revealed, onShow, onBlur }: Props) {
  const { t } = useTranslation();
  const { loaded, loading, failed, load } = useEvidenceBlob();
  const [viewer, setViewer] = useState(false);
  const name = item.originalName || item.fileId || item.evidenceId;
  const usePreview = Boolean(item.hasPreview);

  // First reveal fetches; a later blur keeps the object so Show again is instant.
  useEffect(() => {
    if (revealed && !loaded && !loading && !failed) void load(item.evidenceId, usePreview, item.mimetype);
  }, [revealed, loaded, loading, failed, load, item.evidenceId, item.mimetype, usePreview]);

  const blurred = !revealed;
  const meta = [item.mimetype, formatBytes(item.size)].filter(Boolean).join(', ');

  return (
    <div className="flex w-[180px] flex-col gap-2 min-w-0">
      <div className="relative h-[140px] w-[180px] overflow-hidden rounded-xl bg-gray-100 flex items-center justify-center">
        {loaded ? (
          <Inline loaded={loaded} name={name} blurred={blurred} fill />
        ) : (
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 blur-md"
          />
        )}
        {!loaded && (
          <span className="relative text-xs text-gray-600 px-2 text-center">
            {loading ? t('evidence.media.loading') : failed ? t('evidence.media.loadFailed') : t('evidence.media.hidden')}
          </span>
        )}
      </div>
      <div className="min-w-0 text-xs">
        <div className="truncate text-gray-800" title={name}>
          {name}
        </div>
        {meta && <div className="text-gray-500 truncate">{meta}</div>}
      </div>
      <div className="flex flex-wrap gap-2 text-xs">
        {blurred ? (
          <button type="button" className="text-brand-500 underline" onClick={onShow}>
            {t('evidence.media.show')}
          </button>
        ) : (
          <>
            <button type="button" className="text-brand-500 underline" onClick={onBlur}>
              {t('evidence.media.blur')}
            </button>
            {failed && (
              <button
                type="button"
                className="text-brand-500 underline"
                onClick={() => void load(item.evidenceId, usePreview, item.mimetype)}
              >
                {t('evidence.media.retry')}
              </button>
            )}
            <button type="button" className="text-brand-500 underline" onClick={() => setViewer(true)}>
              {t('evidence.media.openOriginal')}
            </button>
          </>
        )}
      </div>
      {viewer && <OriginalViewer item={item} onClose={() => setViewer(false)} />}
    </div>
  );
}
