import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import cn from 'classnames';
import { useEffect, useId, useState } from 'react';
import { HexColorInput, HexColorPicker } from 'react-colorful';
import { useTranslation } from '../../../i18n/useTranslation';
import { FieldLabel, inputClass } from './Fields';
import { toHex } from './options';

interface Props {
  label: string;
  hint?: string;
  value: string;
  // What the widget uses while this field is unset.
  fallback: string;
  swatches: string[];
  onChange: (v: string) => void;
}

const CHECKER =
  'repeating-conic-gradient(rgb(var(--c-gray-200)) 0% 25%, transparent 0% 50%) 50% / 10px 10px';

export function ColorField({ label, hint, value, fallback, swatches, onChange }: Props) {
  const { t } = useTranslation();
  const id = useId();
  const hex = toHex(value);
  // The widget takes any CSS color; the picker itself only speaks hex.
  const isCssColor = (v: string) =>
    typeof CSS !== 'undefined' && CSS.supports('color', v);
  const shown = hex || fallback;
  const swatchColor = hex || (value && isCssColor(value) ? value : fallback);
  const isUnset = !value;
  // Free-typed text is kept locally until it is a valid color, so typing
  // "#1a" on the way to "#1a2b3c" doesn't wipe the field.
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);

  const commitDraft = (text: string) => {
    setDraft(text);
    const trimmed = text.trim();
    if (!trimmed) return onChange('');
    const next = toHex(trimmed) || (isCssColor(trimmed) ? trimmed : null);
    if (next) onChange(next);
  };

  return (
    <div>
      <FieldLabel htmlFor={id} label={label} hint={hint} />
      <div className="flex items-center gap-2">
        <Popover className="relative shrink-0">
          <PopoverButton
            aria-label={t('aiWidgetAppearance.pickColor').replace('{label}', label)}
            className="size-9 rounded-xl border border-gray-300 overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            style={{ background: CHECKER }}
          >
            <span
              className={cn('block size-full', isUnset && 'opacity-60')}
              style={{ backgroundColor: swatchColor }}
            />
          </PopoverButton>
          <PopoverPanel
            anchor={{ to: 'bottom start', gap: 8 }}
            className="z-50 w-[232px] p-3 rounded-2xl bg-white border border-gray-200 shadow-xl"
          >
            <HexColorPicker color={shown} onChange={onChange} style={{ width: '100%', height: 150 }} />
            <div className="flex items-center gap-2 mt-3">
              <span className="text-xs text-gray-500 font-sans">HEX</span>
              <HexColorInput
                color={shown}
                onChange={onChange}
                prefixed
                className={cn(inputClass, 'font-mono uppercase py-1.5')}
              />
            </div>
            <div className="grid grid-cols-6 gap-1.5 mt-3">
              {swatches.map((s) => (
                <button
                  key={s}
                  type="button"
                  title={s}
                  onClick={() => onChange(s)}
                  className={cn(
                    'size-7 rounded-lg border',
                    hex === s ? 'border-brand-500 ring-2 ring-brand-500/40' : 'border-gray-300'
                  )}
                  style={{ backgroundColor: s }}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => onChange('')}
              disabled={isUnset}
              className="mt-3 w-full text-xs font-sans text-brand-500 hover:underline disabled:text-gray-400 disabled:no-underline"
            >
              {t('aiWidgetAppearance.useDefaultColor')}
            </button>
          </PopoverPanel>
        </Popover>
        <input
          id={id}
          type="text"
          value={draft}
          placeholder={`${fallback} · ${t('aiWidgetAppearance.defaultShort')}`}
          onChange={(e) => commitDraft(e.target.value)}
          onBlur={() => setDraft(value)}
          className={cn(inputClass, 'font-mono')}
          spellCheck={false}
        />
      </div>
    </div>
  );
}
