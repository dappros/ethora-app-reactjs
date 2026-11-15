// Ethora.com platform, copyright: Dappros Ltd (c) 2026, all rights reserved
//
// Reviewer protection (docs/TRUST_AND_SAFETY.md section 14), shared by
// T&S > Quarantine (case media) and the Moderation queues:
//   - MediaSignalSummary: plain-language lines from the stored signals and
//     the AI description, shown before anything is opened;
//   - SaferMediaElement: the image / video at a reveal step (greyscale and
//     heavily blurred, then clear). Video is muted and never plays by itself;
//     going back to blurred pauses it;
//   - RevealControls: Show, Show clearly, Blur again, Hide.
import cn from 'classnames';
import { type ReactNode, useEffect, useRef } from 'react';
import { useTranslation } from '../../i18n/useTranslation';
import type { MediaModeration } from '../../models';
import { descriptionOf, revealClasses, summarizeSignals, type RevealStep } from '../../utils/mediaSignals';

export function MediaSignalSummary({ moderation, className }: { moderation: MediaModeration | null | undefined; className?: string }) {
  const { t } = useTranslation();
  const lines = summarizeSignals(moderation, t);
  const description = descriptionOf(moderation);
  return (
    <div className={cn('min-w-0 text-xs', className)} aria-label={t('tsSignals.summaryLabel')}>
      <ul className="flex flex-col gap-0.5">
        {lines.map((line) => (
          <li key={line} className="text-gray-800 break-words">
            {line}
          </li>
        ))}
      </ul>
      {description && (
        <p className="mt-1 text-gray-600 italic break-words">{t('tsSignals.description').replace('{text}', description)}</p>
      )}
    </div>
  );
}

interface ElementProps {
  src: string;
  kind: 'image' | 'video' | 'audio' | 'other';
  step: RevealStep;
  name: string;
  // Cover a fixed box (tiles) instead of fitting the viewer.
  fill?: boolean;
  onError?: () => void;
  // Shown for a type that cannot be displayed inline.
  fallback?: ReactNode;
}

/** An image, video or audio file at a reveal step ('hidden' renders nothing). */
export function SaferMediaElement({ src, kind, step, name, fill, onError, fallback = null }: ElementProps) {
  const video = useRef<HTMLVideoElement | null>(null);
  const clear = step === 'clear';

  // Muted and paused whenever it is (again) blurred; the muted attribute
  // alone is not reliable once the reviewer has unmuted it.
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    if (step !== 'clear') {
      v.muted = true;
      v.pause();
    }
  }, [step, kind, src]);

  if (step === 'hidden') return null;
  const filter = revealClasses(step);
  if (kind === 'image') {
    return (
      <img
        src={src}
        alt={name}
        onError={onError}
        className={cn('transition', fill ? 'h-full w-full object-cover' : 'max-h-[75vh] max-w-full object-contain', filter)}
      />
    );
  }
  if (kind === 'video') {
    return (
      <video
        ref={video}
        src={src}
        muted
        playsInline
        preload="metadata"
        controls={clear}
        onError={onError}
        className={cn('transition', fill ? 'h-full w-full object-cover' : 'max-h-[75vh] max-w-full', filter)}
      />
    );
  }
  if (kind === 'audio') {
    return <audio src={src} controls={clear} className={cn('w-full', !clear && 'opacity-30 pointer-events-none')} />;
  }
  return <>{fallback}</>;
}

interface ControlProps {
  step: RevealStep;
  onShow: () => void;
  onShowClearly: () => void;
  onBlurAgain: () => void;
  onHide: () => void;
}

/** The reveal buttons for a step: Show, then Show clearly / Hide, then Blur again. */
export function RevealControls({ step, onShow, onShowClearly, onBlurAgain, onHide }: ControlProps) {
  const { t } = useTranslation();
  const link = 'text-brand-500 underline';
  if (step === 'hidden') {
    return (
      <button type="button" className={link} onClick={onShow}>
        {t('tsReveal.show')}
      </button>
    );
  }
  return (
    <>
      {step === 'muted' ? (
        <button type="button" className={link} onClick={onShowClearly}>
          {t('tsReveal.showClearly')}
        </button>
      ) : (
        <button type="button" className={link} onClick={onBlurAgain}>
          {t('tsReveal.blurAgain')}
        </button>
      )}
      <button type="button" className={link} onClick={onHide}>
        {t('tsReveal.hide')}
      </button>
    </>
  );
}
