import { Radio, RadioGroup } from '@headlessui/react';
import cn from 'classnames';
import { useTranslation } from '../../i18n/useTranslation';
import { useAppStore } from '../../store/useAppStore';
import { UI_THEME_OPTIONS, UiTheme } from '../../utils/uiTheme';

const LABEL_KEYS: Record<UiTheme, string> = {
  light: 'appearance.themeLight',
  dark: 'appearance.themeDark',
  system: 'appearance.themeSystem',
};

// Miniature of the app in each theme, so the choice reads at a glance. The
// colours are literal on purpose: the "Light" swatch must look light even
// while the app itself is dark, and vice versa.
function ThemeSwatch({ theme }: { theme: UiTheme }) {
  const pane = (dark: boolean) => (
    <div
      className={cn(
        'flex-1 h-full p-1.5 flex flex-col gap-1',
        dark ? 'bg-[#0f1115]' : 'bg-[#f5f7f9]'
      )}
    >
      <div
        className={cn(
          'h-1.5 w-2/3 rounded-full',
          dark ? 'bg-[#3d414a]' : 'bg-[#d9d9d9]'
        )}
      />
      <div
        className={cn(
          'flex-1 rounded',
          dark ? 'bg-[#1a1c21]' : 'bg-[#ffffff]'
        )}
      />
    </div>
  );

  return (
    <div className="flex h-[56px] w-full overflow-hidden rounded-lg border border-gray-200">
      {theme === 'light' && pane(false)}
      {theme === 'dark' && pane(true)}
      {theme === 'system' && (
        <>
          {pane(false)}
          {pane(true)}
        </>
      )}
    </div>
  );
}

// Light / Dark / System. Applies instantly (see theme/ThemeBridge.tsx) and is
// remembered per device.
export function ThemeSettings() {
  const { t } = useTranslation();
  const uiTheme = useAppStore((s) => s.uiTheme);
  const doSetUiTheme = useAppStore((s) => s.doSetUiTheme);

  return (
    <RadioGroup
      value={uiTheme}
      onChange={doSetUiTheme}
      aria-label={t('appearance.themeHeading')}
      className="grid grid-cols-3 gap-2 max-w-[416px]"
    >
      {UI_THEME_OPTIONS.map((option) => (
        <Radio
          key={option}
          value={option}
          className={cn(
            'group cursor-pointer rounded-xl border p-2 flex flex-col gap-2 items-stretch',
            'border-gray-200 hover:bg-brand-hover',
            'data-[checked]:border-brand-500 data-[checked]:bg-brand-150',
            'focus:outline-none data-[focus]:ring-2 data-[focus]:ring-brand-500'
          )}
        >
          <ThemeSwatch theme={option} />
          <span className="text-center text-sm group-data-[checked]:text-brand-500">
            {t(LABEL_KEYS[option])}
          </span>
        </Radio>
      ))}
    </RadioGroup>
  );
}
