// Ethora.com platform, copyright: Dappros Ltd (c) 2026, all rights reserved
//
// App settings > Trust & Safety: per-App overrides that can only make the
// install policy stricter (App.trustSafety, docs/TRUST_AND_SAFETY.md
// section 2). Each row shows the server value; options looser than it are
// disabled, and a threshold may only go down. Saved with the rest of the App
// settings (the page's Save button).
import classNames from 'classnames';
import { AppTrustSafetyInfo, TrustSafetyPolicy } from '../../models';
import { useTranslation } from '../../i18n/useTranslation';
import { TS_IMAGE_LEVEL_ORDER, TS_OVERRIDE_ROWS, TsOverrideDraft, actionRank, invalidOverrides, levelRank } from '../../utils/trustSafety';

interface Props {
  info: AppTrustSafetyInfo | null;
  loadError: string | null;
  draft: TsOverrideDraft;
  setDraft: (next: TsOverrideDraft) => void;
  disabled?: boolean;
}

export function TrustSafety({ info, loadError, draft, setDraft, disabled }: Props) {
  const { t } = useTranslation();
  const install: TrustSafetyPolicy | null = info?.install || null;
  const effective: TrustSafetyPolicy | null = info?.effective || null;
  const invalid = invalidOverrides(draft, install);
  const actionLabel = (a?: string | null) => (a ? t(`trustSafety.action.${a}`) : '');
  const levelLabel = (l?: string | null) => (l ? t(`trustSafety.level.${l}`) : '');
  // Image levels: only when the server has them (older APIs omit imageLevel).
  const serverLevel = install?.imageLevel;
  const levelInvalid = invalid.includes('imageLevel');

  const set = (key: keyof TsOverrideDraft, value: string) => setDraft({ ...draft, [key]: value });

  const selectClass =
    'rounded-xl bg-gray-100 py-[10px] px-[12px] w-full outline-none font-sans text-sm disabled:opacity-60';
  const inputClass =
    'rounded-xl bg-gray-100 py-[10px] px-[12px] w-[120px] outline-none font-sans text-sm disabled:opacity-60';

  return (
    <div className="overflow-y-auto pb-8 pr-2">
      <p className="font-sans text-[24px] font-medium mb-2">{t('trustSafetyApp.heading')}</p>
      <p className="font-sans text-sm mb-4 max-w-[720px]">{t('trustSafetyApp.description')}</p>
      {loadError && (
        <p className="font-sans text-[12px] text-red-600 dark:text-red-400 mb-4">
          {t('trustSafetyApp.loadFailed').replace('{error}', loadError)}
        </p>
      )}
      {info && !info.enabled && (
        <div className="mb-6 max-w-[720px] rounded-xl border border-amber-200 bg-amber-50 text-amber-900 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-300 p-3 text-sm">
          {t('trustSafetyApp.disabledNote')}
        </div>
      )}
      {!install && !loadError && info && (
        <p className="font-sans text-[12px] text-gray-500 mb-4">{t('trustSafetyApp.noInstall')}</p>
      )}

      <div className="flex flex-col gap-6 max-w-[720px]">
        {serverLevel && (
          <div className="rounded-2xl bg-gray-50 p-4">
            <div className="font-sans text-sm font-semibold">{t('trustSafetyApp.row.imageLevel')}</div>
            <div className="font-sans text-[12px] text-gray-500 mb-3">{t('trustSafetyApp.row.imageLevel.desc')}</div>
            <label className="block min-w-0">
              <span className="block text-gray-500 text-[12px] font-sans mb-1">{t('trustSafetyApp.levelLabel')}</span>
              <select
                className={classNames(selectClass, levelInvalid && 'border border-red-500')}
                value={draft.imageLevel}
                disabled={disabled}
                onChange={(e) => set('imageLevel', e.target.value)}
              >
                <option value="">{t('trustSafetyApp.followServer').replace('{value}', levelLabel(serverLevel))}</option>
                {TS_IMAGE_LEVEL_ORDER.map((l) => {
                  const looser = serverLevel !== 'custom' && levelRank(l) < levelRank(serverLevel);
                  return (
                    <option key={l} value={l} disabled={looser}>
                      {levelLabel(l)}
                      {looser ? ` (${t('trustSafetyApp.looser')})` : ''}
                    </option>
                  );
                })}
              </select>
              {levelInvalid && (
                <span className="block font-sans text-[12px] text-red-600 dark:text-red-400 mt-1">{t('trustSafetyApp.looser')}</span>
              )}
            </label>
            {draft.imageLevel && levelRank(draft.imageLevel) >= 0 && (
              <p className="font-sans text-[12px] text-gray-600 mt-2">{t(`trustSafety.level.${draft.imageLevel}.desc`)}</p>
            )}
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-sans text-[12px] text-gray-500">
              <span>{t('trustSafetyApp.serverValue').replace('{value}', levelLabel(serverLevel))}</span>
              {effective?.imageLevel && <span>{t('trustSafetyApp.inEffect').replace('{value}', levelLabel(effective.imageLevel))}</span>}
            </div>
            {serverLevel === 'custom' && (
              <p className="font-sans text-[12px] text-gray-500 mt-1">{t('trustSafetyApp.levelOverCustom')}</p>
            )}
          </div>
        )}
        {TS_OVERRIDE_ROWS.map((row) => {
          const serverAction = install?.[row.action];
          const serverThreshold = row.threshold && install ? install[row.threshold] : undefined;
          const actionInvalid = invalid.includes(row.action);
          const thresholdInvalid = row.threshold ? invalid.includes(row.threshold) : false;
          const thresholdValue = row.threshold ? draft[row.threshold] : '';
          const thresholdNumber = Number(thresholdValue);
          return (
            <div key={row.id} className="rounded-2xl bg-gray-50 p-4">
              <div className="font-sans text-sm font-semibold">{t(`trustSafetyApp.row.${row.id}`)}</div>
              <div className="font-sans text-[12px] text-gray-500 mb-3">{t(`trustSafetyApp.row.${row.id}.desc`)}</div>
              <div className="grid grid-cols-1 sm:grid-cols-[1fr,_auto] gap-4 items-start">
                <label className="block min-w-0">
                  <span className="block text-gray-500 text-[12px] font-sans mb-1">{t('trustSafetyApp.actionLabel')}</span>
                  <select
                    className={classNames(selectClass, actionInvalid && 'border border-red-500')}
                    value={draft[row.action]}
                    disabled={disabled}
                    onChange={(e) => set(row.action, e.target.value)}
                  >
                    <option value="">
                      {serverAction
                        ? t('trustSafetyApp.followServer').replace('{value}', actionLabel(serverAction))
                        : t('trustSafetyApp.followServerUnknown')}
                    </option>
                    {row.actions.map((a) => {
                      const looser = Boolean(serverAction) && actionRank(a) < actionRank(serverAction);
                      return (
                        <option key={a} value={a} disabled={looser}>
                          {actionLabel(a)}
                          {looser ? ` (${t('trustSafetyApp.looser')})` : ''}
                        </option>
                      );
                    })}
                  </select>
                  {actionInvalid && (
                    <span className="block font-sans text-[12px] text-red-600 dark:text-red-400 mt-1">{t('trustSafetyApp.looser')}</span>
                  )}
                </label>
                {row.threshold && (
                  <label className="block">
                    <span className="block text-gray-500 text-[12px] font-sans mb-1">{t('trustSafetyApp.thresholdLabel')}</span>
                    <input
                      type="number"
                      min={1}
                      max={serverThreshold ?? 100}
                      step={1}
                      className={classNames(inputClass, thresholdInvalid && 'border border-red-500')}
                      placeholder={serverThreshold !== undefined ? String(serverThreshold) : ''}
                      value={thresholdValue}
                      disabled={disabled}
                      onChange={(e) => set(row.threshold!, e.target.value)}
                    />
                  </label>
                )}
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-sans text-[12px] text-gray-500">
                {serverAction && (
                  <span>
                    {t('trustSafetyApp.serverValue').replace(
                      '{value}',
                      serverThreshold !== undefined ? `${actionLabel(serverAction)}, ${serverThreshold}%` : actionLabel(serverAction)
                    )}
                  </span>
                )}
                {effective && (
                  <span>
                    {t('trustSafetyApp.inEffect').replace(
                      '{value}',
                      row.threshold
                        ? `${actionLabel(effective[row.action])}, ${effective[row.threshold]}%`
                        : actionLabel(effective[row.action])
                    )}
                  </span>
                )}
              </div>
              {row.threshold && thresholdInvalid && (
                <p className="font-sans text-[12px] text-red-600 dark:text-red-400 mt-1">
                  {Number.isInteger(thresholdNumber) && thresholdNumber >= 1 && thresholdNumber <= 100 && serverThreshold !== undefined
                    ? t('trustSafetyApp.thresholdTooHigh').replace('{max}', String(serverThreshold))
                    : t('trustSafetyApp.thresholdInvalid')}
                </p>
              )}
              {row.threshold && !thresholdInvalid && serverThreshold !== undefined && (
                <p className="font-sans text-[12px] text-gray-500 mt-1">
                  {t('trustSafetyApp.thresholdHelp').replace('{value}', String(serverThreshold))}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
