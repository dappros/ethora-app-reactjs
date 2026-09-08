import { Dialog, DialogPanel } from '@headlessui/react';
import cn from 'classnames';
import { useTranslation } from '../../i18n/useTranslation';
import { IconClose } from '../Icons/IconClose';

// Generic over the code type so both callers stay type-safe: the app-language
// picker passes UiLocale (the bundle's catalogue), while the chat-language
// picker passes plain strings, because the translation server can support
// languages this bundle has no dictionary for.
interface Props<T extends string> {
  value: T | null;
  // The languages to offer, already resolved by the caller. Passed in rather
  // than read from the catalogue so the sheet can never show a language the
  // server would reject.
  options: readonly { id: T; name: string }[];
  onSelect: (code: T) => void;
  onClose: () => void;
  // Heading text. Defaults to the generic "select a language" caption; the
  // profile passes a specific one so two pickers on the same screen (interface
  // vs chat translation) don't open identical-looking sheets.
  title?: string;
}

// Mobile-optimized: a bottom sheet (anchored to the viewport bottom, rounded
// top corners, drag-handle affordance) below the `sm` breakpoint; a centered
// card above it. Replaces the old cramped <select> - big tappable rows work
// far better on a phone than a native dropdown crammed into a small popover.
export function LanguageModal<T extends string>({
  value,
  options,
  onSelect,
  onClose,
  title,
}: Props<T>) {
  const { t } = useTranslation();

  return (
    <Dialog
      open={true}
      onClose={onClose}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
    >
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
      <DialogPanel className="relative bg-white w-full sm:max-w-[420px] sm:m-8 rounded-t-3xl sm:rounded-3xl p-4 sm:p-8 max-h-[85vh] overflow-y-auto">
        {/* Drag-handle affordance, mobile only - signals "this sheet can be
            dismissed" without needing the explicit close button there. */}
        <div className="sm:hidden w-10 h-1.5 bg-gray-200 rounded-full mx-auto mb-4" />
        <div className="flex items-center justify-between mb-4">
          <div className="font-varela text-[18px] sm:text-[24px]">
            {title ?? t('language.select')}
          </div>
          <button onClick={onClose} aria-label="Close">
            <IconClose />
          </button>
        </div>
        <div className="flex flex-col gap-1">
          {options.map((lang) => {
            const selected = value === lang.id;
            return (
              <button
                key={lang.id}
                onClick={() => onSelect(lang.id)}
                className={cn(
                  'flex items-center justify-between w-full text-left px-4 py-3 rounded-xl hover:bg-brand-hover',
                  selected && 'bg-brand-150'
                )}
              >
                <span
                  className={cn(
                    'font-sans text-[16px]',
                    selected && 'text-brand-500'
                  )}
                >
                  {lang.name}
                </span>
                {selected && (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M16.6673 5L7.50065 14.1667L3.33398 10"
                      stroke="currentColor"
                      className="text-brand-500"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      </DialogPanel>
    </Dialog>
  );
}
