import classNames from 'classnames';
import { useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from '../i18n/useTranslation';
import { inactiveDays, inactivityLevel, InactivityLevel } from '../lib/appInactivity';
import { IconInfo } from './Icons/IconInfo';

interface Props {
  lastActivityAt?: string | null;
}

const valueClass: Record<InactivityLevel, string> = {
  none: 'text-gray-500',
  recent: 'text-gray-900',
  warn: 'text-amber-600 dark:text-amber-400',
  danger: 'text-red-600 dark:text-red-400 font-semibold',
};

// "Inactive" cell of the app card stats grid: days since the app last had any
// activity. The explanation sits behind an info button that works on touch
// (tap to open, tap outside or Esc to close) and also shows as a native title
// on hover, because the hover-only Tooltip used by the other cells cannot be
// reached on a phone and does not wrap long text.
export function AppInactiveStat({ lastActivityAt }: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const tipId = useId();

  const days = inactiveDays(lastActivityAt);
  const level = inactivityLevel(days);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  let text: string;
  if (days === null) text = t('applicationPreview.stats.inactiveNever');
  else if (days === 0) text = t('applicationPreview.stats.inactiveToday');
  else if (days === 1) text = t('applicationPreview.stats.inactiveDayOne');
  else text = t('applicationPreview.stats.inactiveDaysMany').replace('{n}', String(days));

  const tooltip = t('applicationPreview.stats.inactiveTooltip');

  return (
    <div
      ref={rootRef}
      className="relative flex flex-col justify-center items-center"
      data-testid="app-inactive-stat"
      data-level={level}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-describedby={open ? tipId : undefined}
        title={tooltip}
        className="flex items-center text-gray-500 font-sans text-xs min-h-[40px] md:min-h-0 px-2 -my-3 md:my-0"
      >
        <span className="mr-2">{t('applicationPreview.stats.inactiveLabel')}</span>
        <IconInfo />
      </button>
      <div className={classNames('font-sans text-sm text-center', valueClass[level])}>{text}</div>
      {open && (
        <div
          id={tipId}
          role="tooltip"
          className="absolute z-20 top-full mt-1 right-0 w-[220px] max-w-[70vw] p-2 font-sans text-[12px] leading-snug text-left text-black bg-white rounded-lg shadow border border-gray-200"
        >
          {tooltip}
        </div>
      )}
    </div>
  );
}
