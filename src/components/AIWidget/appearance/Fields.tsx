import { Switch } from '@mui/material';
import cn from 'classnames';
import { ReactNode, useId } from 'react';

export const inputClass =
  'bg-gray-100 py-2 px-3 rounded-xl w-full text-sm font-sans outline-none border border-transparent focus:border-brand-500 transition-colors placeholder:text-gray-400';

export function FieldLabel({
  htmlFor,
  label,
  hint,
}: {
  htmlFor?: string;
  label: string;
  hint?: string;
}) {
  return (
    <div className="mb-1.5">
      <label htmlFor={htmlFor} className="block font-sans text-xs font-semibold text-gray-700">
        {label}
      </label>
      {hint && <p className="font-sans text-xs text-gray-500 mt-0.5">{hint}</p>}
    </div>
  );
}

export function Card({
  title,
  description,
  children,
  className,
}: {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('border border-gray-200 rounded-2xl p-4 bg-white', className)}>
      {title && (
        <div className="mb-3">
          <h4 className="font-sans font-semibold text-sm">{title}</h4>
          {description && <p className="font-sans text-xs text-gray-500 mt-0.5">{description}</p>}
        </div>
      )}
      {children}
    </section>
  );
}

export function TextField({
  label,
  hint,
  value,
  placeholder,
  onChange,
  multiline = false,
  maxLength,
  className,
}: {
  label: string;
  hint?: string;
  value: string;
  placeholder?: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  maxLength?: number;
  className?: string;
}) {
  const id = useId();
  return (
    <div className={className}>
      <FieldLabel htmlFor={id} label={label} hint={hint} />
      {multiline ? (
        <textarea
          id={id}
          rows={2}
          value={value}
          placeholder={placeholder}
          maxLength={maxLength}
          onChange={(e) => onChange(e.target.value)}
          className={cn(inputClass, 'resize-none leading-snug')}
        />
      ) : (
        <input
          id={id}
          type="text"
          value={value}
          placeholder={placeholder}
          maxLength={maxLength}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
        />
      )}
    </div>
  );
}

export function SelectField({
  label,
  hint,
  value,
  onChange,
  options,
  className,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
  className?: string;
}) {
  const id = useId();
  return (
    <div className={className}>
      <FieldLabel htmlFor={id} label={label} hint={hint} />
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(inputClass, 'cursor-pointer')}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function SwitchRow({
  label,
  description,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <div className={cn('flex items-center justify-between gap-4 py-2', disabled && 'opacity-50')}>
      <label htmlFor={id} className="min-w-0 cursor-pointer">
        <span className="block font-sans text-sm">{label}</span>
        {description && (
          <span className="block font-sans text-xs text-gray-500 mt-0.5">{description}</span>
        )}
      </label>
      <Switch
        id={id}
        size="small"
        checked={checked}
        disabled={disabled}
        onChange={(_, v) => onChange(v)}
      />
    </div>
  );
}

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
  size = 'md',
}: {
  value: T;
  onChange: (v: T) => void;
  options: Array<{ value: T; label: ReactNode }>;
  ariaLabel: string;
  size?: 'sm' | 'md';
}) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} className="inline-flex p-1 rounded-xl bg-gray-100 gap-1 max-w-full overflow-x-auto">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={cn(
              'rounded-lg font-sans font-medium whitespace-nowrap transition-colors inline-flex items-center gap-1.5',
              size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm',
              active
                ? 'bg-white shadow-sm text-brand-500'
                : 'text-gray-600 hover:text-gray-900'
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function SliderField({
  label,
  value,
  min,
  max,
  step = 1,
  format,
  onChange,
  disabled,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  format?: (v: number) => string;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <div className={cn(disabled && 'opacity-50')}>
      <div className="flex items-center justify-between mb-1">
        <label htmlFor={id} className="font-sans text-xs font-semibold text-gray-700">
          {label}
        </label>
        <span className="text-xs text-gray-600 font-mono tabular-nums bg-gray-100 rounded-md px-1.5 py-0.5">
          {format ? format(value) : value}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-6 accent-brand-500 cursor-pointer"
      />
    </div>
  );
}
