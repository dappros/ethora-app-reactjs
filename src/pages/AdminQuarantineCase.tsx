// Ethora.com platform, copyright: Dappros Ltd (c) 2026, all rights reserved
//
// T&S > Quarantine > case (docs/TRUST_AND_SAFETY.md section 11): the
// transcript, the kept media, hashes, reports, who viewed the case, and the
// case actions: extend, legal hold and release, record a report, export and
// purge. Every view and action is audited by the API; the page says so above
// the case. Media (section 14) starts as a signal summary and the AI
// description with no image; Show (after a warning) fetches it greyscale and
// blurred, Show clearly is a second step.
import { DateTime } from 'luxon';
import { ReactNode, useCallback, useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { CopyButton } from '../components/CopyButton';
import { EvidenceLoggedNotice, EvidenceNotAllowed } from '../components/evidence/EvidenceAccess';
import { useCanReviewEvidence, useEvidenceLabel } from '../components/evidence/hooks';
import { ModeChip, ReasonChip, ReportedChip, RetentionBadge } from '../components/evidence/EvidenceBadges';
import {
  ExportDialog,
  ExtendDialog,
  PurgeDialog,
  ReleaseHoldDialog,
  ReportDialog,
  ReportInput,
} from '../components/evidence/EvidenceDialogs';
import { EvidenceMediaTile } from '../components/evidence/EvidenceMediaTile';
import { MediaSignalSummary } from '../components/TrustSafety/SaferMedia';
import { formatEvidenceSecond, formatEvidenceTime } from '../components/evidence/format';
import { ConfirmModal } from '../components/modal/ConfirmModal';
import { httpEvidenceCaseAction, httpExportEvidenceCase, httpGetEvidenceCase, httpV2, saveBlobAs } from '../http';
import { useTranslation } from '../i18n/useTranslation';
import type { EvidenceCase, EvidenceCaseAction, EvidenceView, ServerSettingsResponse } from '../models';
import { accessErrorMessage } from '../utils/accessError';
import { apiError } from '../utils/apiError';
import { caseRoomLabel, exportFilename, personName, retentionSettingKey } from '../utils/evidence';
import type { RevealStep } from '../utils/mediaSignals';
import { quarantineListPath } from '../utils/tsHub';

type DialogKind = 'extend' | 'release' | 'report' | 'export' | 'purge' | null;

const SECTION = 'rounded-2xl border border-gray-200 p-4 min-w-0';
const SECTION_TITLE = 'font-varela text-[18px] mb-3';
const BUTTON = 'rounded-xl px-3 py-1.5 text-sm border disabled:opacity-50';
const BUTTON_PLAIN = `${BUTTON} border-gray-300 text-gray-800 hover:bg-gray-50`;

// A failed blob request carries its JSON error body as a Blob; read it so
// the toast shows the API's message.
async function blobAwareError(e: unknown, t: (k: string) => string): Promise<string> {
  const data = (e as { response?: { data?: unknown } })?.response?.data;
  if (typeof Blob !== 'undefined' && data instanceof Blob) {
    try {
      const body = JSON.parse(await data.text());
      if (body?.error || body?.message) return String(body.error || body.message);
    } catch {
      // not JSON: fall back to the status text
    }
  }
  return accessErrorMessage(e, t);
}

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-gray-500 text-[12px]">{label}</dt>
      <dd className="text-sm text-gray-800 break-words">{children || '-'}</dd>
    </div>
  );
}

// Who opened the case or its media (the last 20, newest first).
function ViewedBy({ views }: { views: EvidenceView[] }) {
  const { t } = useTranslation();
  if (!views.length) return <p className="text-sm text-gray-500">{t('evidence.viewedBy.empty')}</p>;
  return (
    <ul className="flex flex-col gap-1.5">
      {views.map((v, i) => (
        <li key={`${v.userId}-${v.at}-${i}`} className="text-xs min-w-0">
          <div className="text-gray-800 break-all">{v.email || v.userId || t('evidence.viewedBy.unknown')}</div>
          <div className="text-gray-500">
            {formatEvidenceTime(v.at)}
            {v.kind === 'media' ? `, ${t('evidence.viewedBy.media')}` : v.kind === 'case' ? `, ${t('evidence.viewedBy.case')}` : ''}
          </div>
        </li>
      ))}
    </ul>
  );
}

function QuarantineCaseView({ caseId }: { caseId: string }) {
  const { t } = useTranslation();
  const label = useEvidenceLabel();
  const location = useLocation();
  // The list's filters ride along in the query so Back returns to them.
  const listSearch = location.search.replace(/^\?/, '');
  const [item, setItem] = useState<EvidenceCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [denied, setDenied] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [dialog, setDialog] = useState<DialogKind>(null);
  // Reveal step per media file; missing = hidden.
  const [revealed, setRevealed] = useState<Record<string, RevealStep>>({});
  const setStep = (id: string, step: RevealStep) => setRevealed((r) => ({ ...r, [id]: step }));
  const [confirmShow, setConfirmShow] = useState<string[] | null>(null);
  // Release hold: the retention setting, once read from Server settings.
  const [retentionDays, setRetentionDays] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await httpGetEvidenceCase(caseId);
      setItem(r.data || null);
      setNotFound(!r.data);
    } catch (e) {
      const info = apiError(e, '');
      if (info.status === 404) setNotFound(true);
      else if (info.status === 403) setDenied(true);
      else setError(accessErrorMessage(e, t));
    } finally {
      setLoading(false);
    }
  }, [caseId, t]);

  useEffect(() => {
    setItem(null);
    setRevealed({});
    void load();
  }, [load]);

  const act = async (body: EvidenceCaseAction, done: string) => {
    setBusy(body.action);
    try {
      const r = await httpEvidenceCaseAction(caseId, body);
      toast.success(done);
      setDialog(null);
      // The API answers with the updated case; fetch it when it does not.
      if (r.data?.case) setItem(r.data.case);
      else await load();
    } catch (e) {
      toast.error(t('evidence.toast.failed').replace('{error}', accessErrorMessage(e, t)));
    } finally {
      setBusy(null);
    }
  };

  const extend = (days: number) =>
    act({ action: 'extend', days }, t('evidence.toast.extended').replace('{days}', String(days)));

  const openRelease = async () => {
    setDialog('release');
    if (retentionDays !== null || !item) return;
    try {
      const r = await httpV2.get<ServerSettingsResponse>('/server-settings');
      const key = retentionSettingKey(String(item.reason));
      const s = r.data?.settings?.find((x) => x.key === key);
      const n = Number.parseInt(String(s?.value ?? ''), 10);
      if (Number.isFinite(n) && n > 0) setRetentionDays(n);
    } catch {
      // Leave it empty: the server applies its retention setting.
    }
  };

  const report = (r: ReportInput) => act({ action: 'report', ...r }, t('evidence.toast.reported'));

  const exportCase = async (includeMedia: boolean) => {
    setBusy('export');
    try {
      const r = await httpExportEvidenceCase(caseId, includeMedia);
      const blob = r.data instanceof Blob ? r.data : new Blob([r.data], { type: 'application/zip' });
      const name = exportFilename(caseId, String(r.headers?.['content-disposition'] || ''));
      saveBlobAs(blob, name);
      toast.success(t('evidence.toast.exported'));
      setDialog(null);
      // The first export computes missing hashes; show them.
      if (item?.media?.some((m) => !m.sha256 || !m.md5)) void load();
    } catch (e) {
      toast.error(t('evidence.toast.exportFailed').replace('{error}', await blobAwareError(e, t)));
    } finally {
      setBusy(null);
    }
  };

  if (denied) return <EvidenceNotAllowed />;

  const back = (
    <Link to={quarantineListPath(listSearch)} className="text-sm text-brand-500 underline">
      {t('evidence.case.back')}
    </Link>
  );

  if (!item) {
    return (
      <div className="min-w-0">
        <div className="mb-3">{back}</div>
        <div className="font-varela text-[24px] mb-2">{t('evidence.case.title')}</div>
        <EvidenceLoggedNotice />
        {loading && <p className="text-sm text-gray-500">{t('evidence.loading')}</p>}
        {!loading && notFound && <div className="bg-brand-150 p-4 text-sm font-sans rounded-xl">{t('evidence.case.notFound')}</div>}
        {!loading && error && (
          <p className="text-sm text-red-600 dark:text-red-400">{t('evidence.case.loadFailed').replace('{error}', error)}</p>
        )}
      </div>
    );
  }

  const purged = Boolean(item.purgedAt);
  const messages = item.messages || [];
  const media = item.media || [];
  const reports = item.reports || [];
  const user = personName(item.user);
  const room = caseRoomLabel(item);
  const hidden = media.filter((m) => (revealed[m.evidenceId] || 'hidden') === 'hidden').map((m) => m.evidenceId);
  const anyBusy = Boolean(busy);
  const holdLine = item.hold && item.holdSetAt
    ? personName(item.holdSetBy)
      ? t('evidence.case.holdSetBy').replace('{date}', formatEvidenceTime(item.holdSetAt)).replace('{name}', personName(item.holdSetBy))
      : t('evidence.case.holdSet').replace('{date}', formatEvidenceTime(item.holdSetAt))
    : '';

  return (
    <div className="min-w-0">
      <div className="mb-3">{back}</div>
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-3">
        <div className="min-w-0">
          <div className="font-varela text-[24px]">
            {t('evidence.case.title')}: {label('evidence.reason', String(item.reason))}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <ReasonChip reason={item.reason} />
            <ModeChip mode={item.mode} />
            <RetentionBadge item={item} />
            <ReportedChip targets={reports.map((r) => String(r.target || '')).filter(Boolean)} />
          </div>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="self-start shrink-0 rounded-xl border border-brand-500 text-brand-500 hover:bg-brand-hover px-4 py-2 text-sm disabled:opacity-50"
        >
          {loading ? t('evidence.loading') : t('evidence.refresh')}
        </button>
      </div>

      <EvidenceLoggedNotice />

      {purged && (
        <p className="mb-4 rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
          {t('evidence.case.purgedNote').replace('{date}', formatEvidenceTime(item.purgedAt))}
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,_1fr),_360px] gap-4 pb-4">
        <div className="flex flex-col gap-4 min-w-0">
          <section className={SECTION}>
            <div className={SECTION_TITLE}>{t('evidence.transcript.title')}</div>
            {messages.length === 0 ? (
              <p className="text-sm text-gray-500">{t('evidence.transcript.empty')}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[12px] text-gray-500">
                      <th className="py-1 pr-3 font-normal whitespace-nowrap">{t('evidence.transcript.time')}</th>
                      <th className="py-1 pr-3 font-normal">{t('evidence.transcript.sender')}</th>
                      <th className="py-1 font-normal">{t('evidence.transcript.text')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {messages.map((m) => {
                      const time = formatEvidenceSecond(m.sentAt);
                      return (
                        <tr key={m.evidenceId || m.stanzaId} className="align-top">
                          <td className="py-2 pr-3 whitespace-nowrap text-xs text-gray-600 tabular-nums" title={time.utc}>
                            {time.local}
                          </td>
                          <td className="py-2 pr-3 text-xs text-gray-800 break-all max-w-[180px]">{personName(m.sender)}</td>
                          <td className="py-2">
                            {m.text ? (
                              <span className="whitespace-pre-wrap break-words">{m.text}</span>
                            ) : (
                              <span className="italic text-gray-500">{t('evidence.transcript.noText')}</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className={SECTION}>
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="font-varela text-[18px]">{t('evidence.media.title')}</div>
              {!purged && hidden.length > 1 && (
                <button type="button" className="text-sm text-brand-500 underline" onClick={() => setConfirmShow(hidden)}>
                  {t('evidence.media.showAll')}
                </button>
              )}
            </div>
            {media.length === 0 ? (
              <p className="text-sm text-gray-500">{t('evidence.media.empty')}</p>
            ) : purged ? (
              <div className="flex flex-col gap-3">
                <p className="text-sm text-gray-500">{t('evidence.media.purgedFiles')}</p>
                <ul className="flex flex-col gap-3">
                  {media.map((m) => (
                    <li key={m.evidenceId} className="min-w-0">
                      <div className="text-xs text-gray-500 break-all mb-1">{m.originalName || m.fileId || m.evidenceId}</div>
                      <MediaSignalSummary moderation={m.moderation} />
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="flex flex-wrap gap-4">
                {media.map((m) => (
                  <EvidenceMediaTile
                    key={m.evidenceId}
                    item={m}
                    step={revealed[m.evidenceId] || 'hidden'}
                    onShow={() => setConfirmShow([m.evidenceId])}
                    onShowClearly={() => setStep(m.evidenceId, 'clear')}
                    onBlurAgain={() => setStep(m.evidenceId, 'muted')}
                    onHide={() => setStep(m.evidenceId, 'hidden')}
                  />
                ))}
              </div>
            )}
          </section>

          {media.length > 0 && (
            <section className={SECTION}>
              <div className={SECTION_TITLE}>{t('evidence.hashes.title')}</div>
              <ul className="flex flex-col gap-3">
                {media.map((m) => (
                  <li key={m.evidenceId} className="min-w-0 text-xs">
                    <div className="text-gray-800 break-all mb-1">{m.originalName || m.fileId || m.evidenceId}</div>
                    {(
                      [
                        ['sha256', m.sha256],
                        ['md5', m.md5],
                      ] as const
                    ).map(([k, v]) => (
                      <div key={k} className="flex items-start gap-2">
                        <span className="w-[64px] shrink-0 text-gray-500">{t(`evidence.hashes.${k}`)}</span>
                        {v ? (
                          <>
                            <code className="font-mono break-all text-gray-800 min-w-0">{v}</code>
                            <span className="shrink-0" title={t('evidence.hashes.copy').replace('{name}', t(`evidence.hashes.${k}`))}>
                              <CopyButton value={v} />
                            </span>
                          </>
                        ) : (
                          <span className="text-gray-500 italic">{t('evidence.hashes.missing')}</span>
                        )}
                      </div>
                    ))}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <div className="flex flex-col gap-4 min-w-0">
          <section className={SECTION}>
            <dl className="grid grid-cols-1 gap-2">
              <Detail label={t('evidence.case.id')}>
                <span className="inline-flex items-start gap-2">
                  <code className="font-mono text-xs break-all">{item.caseId}</code>
                  <CopyButton value={item.caseId} />
                </span>
              </Detail>
              <Detail label={t('evidence.case.user')}>
                {user || t('evidence.unknownUser')}
                {item.user?.email && user !== item.user.email && (
                  <span className="block text-xs text-gray-500 break-all">{item.user.email}</span>
                )}
              </Detail>
              <Detail label={t('evidence.case.app')}>{item.appName || item.appId}</Detail>
              {room && <Detail label={t('evidence.case.room')}>{room}</Detail>}
              <Detail label={t('evidence.case.created')}>{formatEvidenceTime(item.createdAt)}</Detail>
              {!purged && (
                <Detail label={t('evidence.case.expires')}>
                  {item.hold ? holdLine || t('evidence.retention.hold') : item.expiresAt ? formatEvidenceTime(item.expiresAt) : t('evidence.retention.none')}
                </Detail>
              )}
            </dl>
          </section>

          <section className={SECTION}>
            <div className={SECTION_TITLE}>{t('evidence.actions.title')}</div>
            {purged ? (
              <div className="flex flex-col gap-3">
                <p className="text-sm text-gray-500">{t('evidence.purgedActions')}</p>
                <button type="button" disabled={anyBusy} className={BUTTON_PLAIN} onClick={() => setDialog('export')}>
                  {t('evidence.action.export')}
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {!item.hold && (
                  <div className="flex flex-wrap gap-2" title={t('evidence.action.extendTitle')}>
                    <button type="button" disabled={anyBusy} className={BUTTON_PLAIN} onClick={() => void extend(30)}>
                      {t('evidence.action.extend30')}
                    </button>
                    <button type="button" disabled={anyBusy} className={BUTTON_PLAIN} onClick={() => void extend(90)}>
                      {t('evidence.action.extend90')}
                    </button>
                    <button type="button" disabled={anyBusy} className={BUTTON_PLAIN} onClick={() => setDialog('extend')}>
                      {t('evidence.action.extendCustom')}
                    </button>
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {item.hold ? (
                    <button type="button" disabled={anyBusy} className={BUTTON_PLAIN} onClick={() => void openRelease()}>
                      {t('evidence.action.releaseHold')}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={anyBusy}
                      title={t('evidence.action.holdTitle')}
                      className={`${BUTTON} border-blue-600 text-blue-700 hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-950/30`}
                      onClick={() => void act({ action: 'hold' }, t('evidence.toast.held'))}
                    >
                      {busy === 'hold' ? t('evidence.dialog.working') : t('evidence.action.hold')}
                    </button>
                  )}
                  <button type="button" disabled={anyBusy} className={BUTTON_PLAIN} onClick={() => setDialog('report')}>
                    {t('evidence.action.report')}
                  </button>
                  <button type="button" disabled={anyBusy} className={BUTTON_PLAIN} onClick={() => setDialog('export')}>
                    {t('evidence.action.export')}
                  </button>
                </div>
                <div>
                  <button
                    type="button"
                    disabled={anyBusy}
                    className={`${BUTTON} border-red-400 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30`}
                    onClick={() => setDialog('purge')}
                  >
                    {t('evidence.action.purge')}
                  </button>
                </div>
              </div>
            )}
          </section>

          <section className={SECTION}>
            <div className={SECTION_TITLE}>{t('evidence.viewedBy.title')}</div>
            <ViewedBy views={item.viewedBy || []} />
          </section>

          <section className={SECTION}>
            <div className={SECTION_TITLE}>{t('evidence.reports.title')}</div>
            {reports.length === 0 ? (
              <p className="text-sm text-gray-500">{t('evidence.reports.empty')}</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {reports.map((r, i) => {
                  const at = r.at ? DateTime.fromISO(r.at) : null;
                  const by = personName(r.by);
                  return (
                    <li key={`${r.at || ''}-${i}`} className="text-sm min-w-0">
                      <div className="flex flex-wrap items-baseline gap-x-2">
                        <span className="font-semibold">{label('evidence.target', String(r.target || ''))}</span>
                        {at?.isValid && <span className="text-xs text-gray-500">{at.toFormat('dd LLL yyyy t')}</span>}
                        {by && <span className="text-xs text-gray-500">{t('evidence.reports.by').replace('{name}', by)}</span>}
                      </div>
                      {r.reference && (
                        <div className="text-xs text-gray-700 break-all">
                          {t('evidence.reports.reference').replace('{reference}', r.reference)}
                        </div>
                      )}
                      {r.note && <div className="text-xs text-gray-700 whitespace-pre-wrap break-words">{r.note}</div>}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      </div>

      {confirmShow && (
        <ConfirmModal
          title={confirmShow.length > 1 ? t('evidence.media.confirmAllTitle') : t('evidence.media.confirmTitle')}
          message={t('evidence.media.confirmMessage')}
          confirmLabel={t('evidence.media.confirm')}
          danger
          onConfirm={() => {
            const ids = confirmShow;
            setRevealed((r) => ({ ...r, ...Object.fromEntries(ids.map((id) => [id, 'muted' as RevealStep])) }));
            setConfirmShow(null);
          }}
          onCancel={() => setConfirmShow(null)}
        />
      )}
      {dialog === 'extend' && <ExtendDialog busy={busy === 'extend'} onClose={() => setDialog(null)} onSubmit={(d) => void extend(d)} />}
      {dialog === 'release' && (
        <ReleaseHoldDialog
          key={retentionDays ?? 'unknown'}
          busy={busy === 'release_hold'}
          defaultDays={retentionDays}
          onClose={() => setDialog(null)}
          onSubmit={(days) =>
            void act(days ? { action: 'release_hold', days } : { action: 'release_hold' }, t('evidence.toast.released'))
          }
        />
      )}
      {dialog === 'report' && <ReportDialog busy={busy === 'report'} onClose={() => setDialog(null)} onSubmit={report} />}
      {dialog === 'export' && (
        <ExportDialog
          busy={busy === 'export'}
          mediaAvailable={!purged && media.length > 0}
          onClose={() => setDialog(null)}
          onSubmit={(withMedia) => void exportCase(withMedia)}
        />
      )}
      {dialog === 'purge' && (
        <PurgeDialog
          busy={busy === 'purge'}
          reason={String(item.reason || '')}
          onClose={() => setDialog(null)}
          onSubmit={() => {
            setRevealed({});
            void act({ action: 'purge' }, t('evidence.toast.purged'));
          }}
        />
      )}
    </div>
  );
}

// Rendered by the T&S hub (pages/AdminTrustSafety.tsx) under its Quarantine
// tab, at /app/admin/trust-safety/quarantine/:caseId.
export default function AdminQuarantineCase() {
  const allowed = useCanReviewEvidence();
  const { caseId } = useParams();
  if (!allowed) return <EvidenceNotAllowed />;
  if (!caseId) return <Navigate to={quarantineListPath()} replace />;
  return <QuarantineCaseView key={caseId} caseId={caseId} />;
}
