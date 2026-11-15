// Ethora.com platform, copyright: Dappros Ltd (c) 2026, all rights reserved
//
// The dialogs of the evidence case actions (docs/TRUST_AND_SAFETY.md
// section 11): extend by a custom number of days, release a legal hold,
// record a report, export, and purge with a typed confirmation. Each one
// only collects the input; the case view sends the request.
import { Dialog, DialogPanel } from '@headlessui/react';
import cn from 'classnames';
import { FormEvent, ReactNode, useState } from 'react';
import { useTranslation } from '../../i18n/useTranslation';
import type { EvidenceReportTarget } from '../../models';
import { EVIDENCE_REPORT_TARGETS, parseDays, purgeConfirmed } from '../../utils/evidence';
import { IconClose } from '../Icons/IconClose';

const INPUT = 'w-full rounded-xl bg-gray-100 outline-none py-[10px] px-[14px] text-sm font-sans';
const LABEL = 'text-gray-500 text-[12px] font-sans mb-1';

interface ShellProps {
  title: string;
  busy: boolean;
  submitLabel: string;
  // Shown on the submit button while busy (default "Working...").
  busyLabel?: string;
  canSubmit: boolean;
  danger?: boolean;
  onClose: () => void;
  onSubmit: () => void;
  children: ReactNode;
}

export function EvidenceDialog({ title, busy, submitLabel, busyLabel, canSubmit, danger, onClose, onSubmit, children }: ShellProps) {
  const { t } = useTranslation();
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (canSubmit && !busy) onSubmit();
  };
  return (
    <Dialog className="relative z-50" open onClose={busy ? () => {} : onClose}>
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-[520px] max-h-full overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="font-varela text-[22px] break-words min-w-0">{title}</div>
            {!busy && (
              <button type="button" onClick={onClose} aria-label={t('evidence.dialog.close')}>
                <IconClose />
              </button>
            )}
          </div>
          <form className="flex flex-col gap-4 font-sans text-sm" onSubmit={submit}>
            {children}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                disabled={busy}
                onClick={onClose}
                className="w-full py-2.5 rounded-xl border border-brand-500 text-brand-500 hover:bg-brand-hover disabled:opacity-50"
              >
                {t('evidence.dialog.cancel')}
              </button>
              <button
                type="submit"
                disabled={busy || !canSubmit}
                className={cn(
                  'w-full py-2.5 rounded-xl border text-white disabled:opacity-50',
                  danger
                    ? 'bg-red-400 border-red-800 hover:bg-red-300'
                    : 'bg-brand-500 border-brand-darker hover:bg-brand-darker'
                )}
              >
                {busy ? busyLabel || t('evidence.dialog.working') : submitLabel}
              </button>
            </div>
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  );
}

interface BaseProps {
  busy: boolean;
  onClose: () => void;
}

export function ExtendDialog({ busy, onClose, onSubmit }: BaseProps & { onSubmit: (days: number) => void }) {
  const { t } = useTranslation();
  const [value, setValue] = useState('30');
  const days = parseDays(value);
  return (
    <EvidenceDialog
      title={t('evidence.extend.title')}
      busy={busy}
      submitLabel={t('evidence.extend.submit')}
      canSubmit={days !== null}
      onClose={onClose}
      onSubmit={() => days !== null && onSubmit(days)}
    >
      <p className="text-gray-700">{t('evidence.extend.body')}</p>
      <label className="block">
        <div className={LABEL}>{t('evidence.extend.days')}</div>
        <input
          className={INPUT}
          type="number"
          inputMode="numeric"
          min={1}
          max={3650}
          step={1}
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        {value.trim() !== '' && days === null && (
          <div className="text-red-600 dark:text-red-400 text-[12px] mt-1">{t('evidence.daysInvalid')}</div>
        )}
      </label>
    </EvidenceDialog>
  );
}

export function ReleaseHoldDialog({
  busy,
  onClose,
  onSubmit,
  defaultDays,
}: BaseProps & { onSubmit: (days?: number) => void; defaultDays: number | null }) {
  const { t } = useTranslation();
  // Pre-filled with the retention setting when it is known; empty = let the
  // server apply its retention setting.
  const [value, setValue] = useState(defaultDays ? String(defaultDays) : '');
  const empty = value.trim() === '';
  const days = parseDays(value);
  return (
    <EvidenceDialog
      title={t('evidence.release.title')}
      busy={busy}
      submitLabel={t('evidence.release.submit')}
      canSubmit={empty || days !== null}
      onClose={onClose}
      onSubmit={() => onSubmit(empty ? undefined : (days ?? undefined))}
    >
      <p className="text-gray-700">{t('evidence.release.body')}</p>
      <label className="block">
        <div className={LABEL}>{t('evidence.release.days')}</div>
        <input
          className={INPUT}
          type="number"
          inputMode="numeric"
          min={1}
          max={3650}
          step={1}
          autoFocus
          placeholder={defaultDays ? String(defaultDays) : ''}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <div className="text-gray-500 text-[12px] mt-1">
          {defaultDays
            ? t('evidence.release.default').replace('{days}', String(defaultDays))
            : t('evidence.release.defaultUnknown')}
        </div>
        {!empty && days === null && (
          <div className="text-red-600 dark:text-red-400 text-[12px] mt-1">{t('evidence.daysInvalid')}</div>
        )}
      </label>
    </EvidenceDialog>
  );
}

export interface ReportInput {
  target: EvidenceReportTarget;
  reference?: string;
  note?: string;
}

const REFERENCE_MAX = 200;
const NOTE_MAX = 2000;

export function ReportDialog({ busy, onClose, onSubmit }: BaseProps & { onSubmit: (r: ReportInput) => void }) {
  const { t } = useTranslation();
  const [target, setTarget] = useState<EvidenceReportTarget | ''>('');
  const [reference, setReference] = useState('');
  const [note, setNote] = useState('');
  const ok = Boolean(target) && reference.trim().length <= REFERENCE_MAX && note.trim().length <= NOTE_MAX;
  return (
    <EvidenceDialog
      title={t('evidence.report.title')}
      busy={busy}
      submitLabel={t('evidence.report.submit')}
      canSubmit={ok}
      onClose={onClose}
      onSubmit={() => {
        if (!target) return;
        const body: ReportInput = { target };
        if (reference.trim()) body.reference = reference.trim();
        if (note.trim()) body.note = note.trim();
        onSubmit(body);
      }}
    >
      <p className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-gray-700">{t('evidence.report.helper')}</p>
      <label className="block">
        <div className={LABEL}>{t('evidence.report.target')}</div>
        <select
          className={INPUT}
          value={target}
          required
          autoFocus
          onChange={(e) => setTarget(e.target.value as EvidenceReportTarget | '')}
        >
          <option value="" disabled>
            {t('evidence.report.target')}
          </option>
          {EVIDENCE_REPORT_TARGETS.map((x) => (
            <option key={x} value={x}>
              {t(`evidence.target.${x}`)}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <div className={LABEL}>{t('evidence.report.reference')}</div>
        <input
          className={INPUT}
          maxLength={REFERENCE_MAX}
          placeholder={t('evidence.report.referencePlaceholder')}
          value={reference}
          onChange={(e) => setReference(e.target.value)}
        />
      </label>
      <label className="block">
        <div className={LABEL}>{t('evidence.report.note')}</div>
        <textarea
          className={`${INPUT} min-h-[80px]`}
          maxLength={NOTE_MAX}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </label>
    </EvidenceDialog>
  );
}

export function ExportDialog({
  busy,
  onClose,
  onSubmit,
  mediaAvailable,
}: BaseProps & { onSubmit: (includeMedia: boolean) => void; mediaAvailable: boolean }) {
  const { t } = useTranslation();
  const [includeMedia, setIncludeMedia] = useState(false);
  return (
    <EvidenceDialog
      title={t('evidence.export.title')}
      busy={busy}
      submitLabel={t('evidence.export.submit')}
      busyLabel={t('evidence.export.busy')}
      canSubmit
      onClose={onClose}
      onSubmit={() => onSubmit(includeMedia && mediaAvailable)}
    >
      <p className="text-gray-700">{t('evidence.export.body')}</p>
      <fieldset className="flex flex-col gap-2">
        <label className="flex items-center gap-2">
          <input type="radio" name="evidence-export-media" checked={!includeMedia} onChange={() => setIncludeMedia(false)} />
          <span>{t('evidence.export.withoutMedia')}</span>
        </label>
        <label className={cn('flex items-start gap-2', !mediaAvailable && 'opacity-50')}>
          <input
            type="radio"
            name="evidence-export-media"
            className="mt-1"
            disabled={!mediaAvailable}
            checked={includeMedia}
            onChange={() => setIncludeMedia(true)}
          />
          <span>
            {t('evidence.export.withMedia')}
            <span className="block text-gray-500 text-[12px]">{t('evidence.export.withMediaHelp')}</span>
          </span>
        </label>
      </fieldset>
    </EvidenceDialog>
  );
}

export function PurgeDialog({ busy, onClose, onSubmit, reason }: BaseProps & { onSubmit: () => void; reason: string }) {
  const { t } = useTranslation();
  const [typed, setTyped] = useState('');
  return (
    <EvidenceDialog
      title={t('evidence.purge.title')}
      busy={busy}
      submitLabel={t('evidence.purge.submit')}
      canSubmit={purgeConfirmed(typed, reason)}
      danger
      onClose={onClose}
      onSubmit={onSubmit}
    >
      <div
        role="alert"
        className="rounded-xl border border-red-200 bg-red-50 text-red-800 dark:bg-red-950/40 dark:border-red-900 dark:text-red-300 p-3"
      >
        {t('evidence.purge.body')}
      </div>
      <label className="block">
        <div className={LABEL}>
          {reason ? t('evidence.purge.type').replace('{reason}', reason) : t('evidence.purge.typeDelete')}
        </div>
        <input
          className={INPUT}
          autoFocus
          autoComplete="off"
          spellCheck={false}
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
        />
      </label>
    </EvidenceDialog>
  );
}
