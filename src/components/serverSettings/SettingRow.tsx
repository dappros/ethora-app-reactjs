// Ethora.com platform, copyright: Dappros Ltd (c) 2026, all rights reserved
//
// One install-wide setting (GET /v2/server-settings): its label, source and
// kind on the left; the input, its error, description and reset link on the
// right. Shared by the Server settings page and T&S > Settings, which keep
// the drafts and save them.
import cn from 'classnames';
import { useTranslation } from '../../i18n/useTranslation';
import type { ServerSetting } from '../../models';
import { TS_PERCENT_KEYS } from '../../utils/trustSafety';

interface InputProps {
  setting: ServerSetting;
  value: string;
  disabled: boolean;
  // Shown greyed out with a "not allowed" cursor (a value the install fixes).
  locked?: boolean;
  onChange: (value: string) => void;
}

export function SettingInput({ setting: s, value, disabled, locked, onChange }: InputProps) {
  const { t } = useTranslation();
  const tr = (key: string, fallback: string) => {
    const v = t(key);
    return v === key ? fallback : v;
  };
  const base = cn(
    'w-full rounded-xl border border-gray-300 p-3 text-sm disabled:opacity-60',
    locked && 'bg-gray-100 text-gray-500 cursor-not-allowed'
  );
  if (s.type === 'boolean') {
    return (
      <select value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} className={base}>
        <option value="true">{t('serverSettings.boolean.true')}</option>
        <option value="false">{t('serverSettings.boolean.false')}</option>
      </select>
    );
  }
  if (s.type === 'choice') {
    return (
      <select value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} className={base}>
        {(s.options || []).map((o) => (
          <option key={o} value={o}>
            {tr(`serverSettings.option.${s.key}.${o}`, o)}
          </option>
        ))}
      </select>
    );
  }
  if (s.type === 'secret') {
    return (
      <input
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={s.value ? `${t('serverSettings.current')}: ${s.value}` : t('serverSettings.secretPlaceholder')}
        autoComplete="new-password"
        className={cn(base, 'font-mono')}
      />
    );
  }
  if (TS_PERCENT_KEYS.includes(s.key)) {
    return (
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={1}
          max={100}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={cn(base, 'max-w-[140px]')}
        />
        <span className="text-sm text-gray-500">{t('trustSafety.percent')}</span>
      </div>
    );
  }
  return (
    <input
      type={s.type === 'integer' ? 'number' : 'text'}
      min={s.type === 'integer' ? 0 : undefined}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      spellCheck={false}
      className={cn(base, s.type === 'cron' && 'font-mono')}
    />
  );
}

interface RowProps extends InputProps {
  error?: string;
  // The reset link (a value saved in the panel, and the right to edit).
  canReset: boolean;
  resetDisabled?: boolean;
  onReset: () => void;
}

export function SettingRow({ setting: s, value, disabled, locked, onChange, error, canReset, resetDisabled, onReset }: RowProps) {
  const { t } = useTranslation();
  const tr = (key: string, fallback = '') => {
    const v = t(key);
    return v === key ? fallback : v;
  };
  const desc = tr(`serverSettings.desc.${s.key}`);
  return (
    <div className="grid grid-cols-1 md:grid-cols-[260px,_1fr] gap-x-4 gap-y-1 min-w-0">
      <div className="min-w-0">
        <div className="text-sm font-semibold">{tr(`serverSettings.key.${s.key}`, s.key)}</div>
        <div className="text-xs text-gray-500">
          {t(`serverSettings.source.${s.source}`)}
          {' | '}
          {s.kind === 'live'
            ? t('serverSettings.kind.live')
            : t('serverSettings.kind.restart').replace('{scope}', t(`serverSettings.scope.${s.scope}`))}
          {s.restartPending && (
            <span className="ml-2 inline-block rounded-full bg-amber-100 text-amber-900 px-2 py-0.5 text-[11px] font-semibold">
              {t('serverSettings.restartPending')}
            </span>
          )}
        </div>
      </div>
      <div className="min-w-0">
        <SettingInput setting={s} value={value} disabled={disabled} locked={locked} onChange={onChange} />
        {error && <div className="mt-1 text-xs text-red-700 dark:text-red-400">{error}</div>}
        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-500">
          {desc && <span>{desc}</span>}
          {s.source === 'panel' && canReset && (
            <button type="button" onClick={onReset} disabled={resetDisabled} className="text-brand-500 underline disabled:opacity-50">
              {t('serverSettings.reset')}
              {s.envValue !== null ? ` (${s.envValue})` : s.default ? ` (${s.default})` : ''}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
