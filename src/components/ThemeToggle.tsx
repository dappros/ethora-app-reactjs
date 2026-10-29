import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from '@headlessui/react';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import SettingsBrightnessOutlinedIcon from '@mui/icons-material/SettingsBrightnessOutlined';
import cn from 'classnames';
import type { ComponentType } from 'react';
import { useTranslation } from '../i18n/useTranslation';
import { useAppStore } from '../store/useAppStore';
import { UI_THEME_OPTIONS, UiTheme } from '../utils/uiTheme';

const OPTIONS: Record<
  UiTheme,
  { labelKey: string; Icon: ComponentType<{ sx?: object }> }
> = {
  light: { labelKey: 'appearance.themeLight', Icon: LightModeOutlinedIcon },
  dark: { labelKey: 'appearance.themeDark', Icon: DarkModeOutlinedIcon },
  system: {
    labelKey: 'appearance.themeSystem',
    Icon: SettingsBrightnessOutlinedIcon,
  },
};

interface Props {
  className?: string;
  size?: 'sm' | 'md';
}

export function ThemeToggle({ className, size = 'md' }: Props) {
  const { t } = useTranslation();
  const uiTheme = useAppStore((s) => s.uiTheme);
  const doSetUiTheme = useAppStore((s) => s.doSetUiTheme);
  const iconSize = size === 'sm' ? 18 : 20;
  const boxClass = size === 'sm' ? 'h-[32px] w-[32px]' : 'h-[42px] w-[44px]';
  const { Icon: CurrentIcon, labelKey: currentLabelKey } = OPTIONS[uiTheme];

  return (
    <Listbox value={uiTheme} onChange={doSetUiTheme}>
      <ListboxButton
        aria-label={`${t('appearance.themeHeading')}: ${t(currentLabelKey)}`}
        title={t(currentLabelKey)}
        className={cn(
          'shrink-0 flex items-center justify-center rounded-xl border border-brand-500 hover:bg-brand-hover',
          'data-[open]:bg-brand-500 data-[open]:text-white focus:outline-none data-[focus]:ring-2 data-[focus]:ring-brand-500',
          boxClass,
          className
        )}
      >
        <CurrentIcon sx={{ fontSize: iconSize }} />
      </ListboxButton>
      <ListboxOptions
        anchor={{ to: 'bottom', gap: 4 }}
        className="z-50 flex flex-col focus:outline-none"
      >
        {UI_THEME_OPTIONS.map((option, i) => {
          const { labelKey, Icon } = OPTIONS[option];
          return (
            <ListboxOption
              key={option}
              value={option}
              title={t(labelKey)}
              aria-label={t(labelKey)}
              className={cn(
                'flex cursor-pointer items-center justify-center bg-white border border-brand-500',
                'data-[focus]:bg-brand-hover data-[selected]:bg-brand-500 data-[selected]:text-white',
                boxClass,
                i === 0 && 'rounded-t-xl',
                i === UI_THEME_OPTIONS.length - 1
                  ? 'rounded-b-xl'
                  : 'border-b-0'
              )}
            >
              <Icon sx={{ fontSize: iconSize }} />
            </ListboxOption>
          );
        })}
      </ListboxOptions>
    </Listbox>
  );
}
