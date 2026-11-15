// Ethora.com platform, copyright: Dappros Ltd (c) 2026, all rights reserved
//
// Server settings > Trust & Safety: the image policy level (TS_IMAGE_LEVEL,
// docs/TRUST_AND_SAFETY.md section 12). Five cards (Off, Relaxed, Standard,
// Strict, Custom), the rule table of the named levels, the custom nudity
// fields while Custom is picked, and an "Advanced thresholds" fold for the
// four percentages. The page renders the setting rows and saves as usual.
import cn from 'classnames';
import type { ReactNode } from 'react';
import { useTranslation } from '../../i18n/useTranslation';
import type { TsImageLevel } from '../../models';
import { TS_IMAGE_LEVELS, TS_IMAGE_LEVEL_ORDER, TS_IMAGE_LEVEL_RULES } from '../../utils/trustSafety';

interface Props {
  value: string;
  disabled?: boolean;
  error?: string;
  onChange: (level: TsImageLevel) => void;
  // Setting rows of TS_IMAGE_NUDITY_ACTION / _THRESHOLD (shown for Custom).
  customRows: ReactNode;
  // Setting rows of the four level thresholds.
  thresholdRows: ReactNode;
}

export function ImageLevelPicker({ value, disabled, error, onChange, customRows, thresholdRows }: Props) {
  const { t } = useTranslation();
  const current = (TS_IMAGE_LEVELS as string[]).includes(value) ? (value as TsImageLevel) : 'custom';

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 min-w-0">
      <div className="text-sm font-semibold">{t('trustSafety.level.title')}</div>
      <p className="mb-3 text-xs text-gray-500">{t('trustSafety.level.intro')}</p>

      <div role="radiogroup" aria-label={t('trustSafety.level.title')} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {TS_IMAGE_LEVELS.map((level) => {
          const active = current === level;
          return (
            <button
              key={level}
              type="button"
              role="radio"
              aria-checked={active}
              disabled={disabled}
              onClick={() => onChange(level)}
              className={cn(
                'text-left rounded-xl border p-3 bg-white min-w-0 transition-colors disabled:opacity-60 disabled:cursor-not-allowed',
                active ? 'border-brand-500 ring-1 ring-brand-500' : 'border-gray-200 hover:border-brand-500'
              )}
            >
              <span className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className={cn(
                    'inline-block h-3.5 w-3.5 shrink-0 rounded-full border',
                    active ? 'border-brand-500 bg-brand-500 ring-2 ring-inset ring-white' : 'border-gray-400'
                  )}
                />
                <span className="text-sm font-semibold">{t(`trustSafety.level.${level}`)}</span>
              </span>
              <span className="mt-1 block text-xs text-gray-600">{t(`trustSafety.level.${level}.desc`)}</span>
            </button>
          );
        })}
      </div>
      {error && <div className="mt-2 text-xs text-red-700">{error}</div>}

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[420px] text-xs">
          <thead>
            <tr className="text-left text-gray-500">
              <th className="py-1 pr-3 font-semibold">{t('trustSafety.level.col.level')}</th>
              <th className="py-1 pr-3 font-semibold">{t('trustSafety.level.col.explicit')}</th>
              <th className="py-1 font-semibold">{t('trustSafety.level.col.revealing')}</th>
            </tr>
          </thead>
          <tbody>
            {TS_IMAGE_LEVEL_ORDER.map((level) => {
              const rule = TS_IMAGE_LEVEL_RULES[level as Exclude<TsImageLevel, 'custom'>];
              return (
                <tr key={level} className={cn('border-t border-gray-100', current === level && 'bg-gray-50 font-semibold')}>
                  <td className="py-1 pr-3">{t(`trustSafety.level.${level}`)}</td>
                  <td className="py-1 pr-3">{t(`trustSafety.levelRule.${rule.explicit}`)}</td>
                  <td className="py-1">{t(`trustSafety.levelRule.${rule.revealing}`)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="mt-2 text-xs text-gray-500">{t('trustSafety.level.ruleNote')}</p>
      </div>

      {current === 'custom' && (
        <div className="mt-4 border-t border-gray-100 pt-4">
          <p className="mb-3 text-xs text-gray-500">{t('trustSafety.level.customNote')}</p>
          <div className="grid grid-cols-1 gap-5">{customRows}</div>
        </div>
      )}

      <details className="mt-4 border-t border-gray-100 pt-3 group">
        <summary className="cursor-pointer text-sm font-semibold text-brand-500 select-none">{t('trustSafety.level.advanced')}</summary>
        <p className="mt-2 mb-3 text-xs text-gray-500">{t('trustSafety.level.advancedIntro')}</p>
        <div className="grid grid-cols-1 gap-5">{thresholdRows}</div>
      </details>
    </div>
  );
}
