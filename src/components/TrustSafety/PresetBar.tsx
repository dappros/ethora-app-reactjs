// Ethora.com platform, copyright: Dappros Ltd (c) 2026, all rights reserved
//
// Server settings > Trust & Safety: the four presets above the TS_* fields.
// Picking one fills the drafts (and TS_PROFILE); the admin saves as usual.
import cn from 'classnames';
import { useTranslation } from '../../i18n/useTranslation';
import { TS_PRESETS, TsPresetName } from '../../utils/trustSafety';

interface Props {
  // The preset the current (drafted) values match, if any.
  current: TsPresetName | null;
  disabled?: boolean;
  onApply: (preset: TsPresetName) => void;
}

export function PresetBar({ current, disabled, onApply }: Props) {
  const { t } = useTranslation();
  return (
    <div className="mb-6">
      <div className="text-sm font-semibold">{t('trustSafety.presets.title')}</div>
      <p className="mb-3 text-xs text-gray-500">{t('trustSafety.presets.intro')}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {TS_PRESETS.map((name) => {
          const active = current === name;
          return (
            <button
              key={name}
              type="button"
              disabled={disabled}
              onClick={() => onApply(name)}
              aria-pressed={active}
              className={cn(
                'text-left rounded-xl border p-3 bg-white min-w-0 transition-colors disabled:opacity-60 disabled:cursor-not-allowed',
                active ? 'border-brand-500 ring-1 ring-brand-500' : 'border-gray-200 hover:border-brand-500'
              )}
            >
              <span className="flex items-center gap-2">
                <span className="text-sm font-semibold">{t(`trustSafety.preset.${name}`)}</span>
                {active && (
                  <span className="rounded-full bg-brand-150 text-brand-500 px-2 py-0.5 text-[11px] font-semibold">
                    {t('trustSafety.presets.current')}
                  </span>
                )}
              </span>
              <span className="mt-1 block text-xs text-gray-600">{t(`trustSafety.preset.${name}.desc`)}</span>
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-gray-500">{t('trustSafety.presets.adultNote')}</p>
    </div>
  );
}
