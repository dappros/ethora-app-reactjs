import { Tab } from '@headlessui/react';
import cn from 'classnames';

interface Props {
  text: string;
  last?: boolean;
  disabled?: boolean;
  // Breakpoint at which the parent TabList flips from a horizontal scroll
  // strip to a vertical rail. Tailwind only picks up literal class names, so
  // each variant carries its own static string instead of interpolating the
  // `md:` / `lg:` prefix.
  breakpoint?: 'md' | 'lg';
}

// Below the breakpoint the tabs are a single horizontal strip: no pills, no
// per-item separators (the TabList already draws one rail line underneath),
// just an underline on the selected tab. The transparent border is always
// there so switching tabs doesn't shift the row by 2px.
const HORIZONTAL_TAB =
  'relative shrink-0 whitespace-nowrap px-3 py-[10px] text-[15px] ' +
  '-mb-px border-b-2 border-transparent transition-colors ' +
  'data-[selected]:border-brand-500 data-[selected]:text-brand-500';

const VERTICAL = {
  md: {
    wrapper: 'md:mb-2',
    separator: 'md:border-b md:border-gray-200',
    tab:
      'md:mb-2 md:w-full md:rounded-xl md:border-b-0 md:px-4 md:py-3 ' +
      'md:text-left md:text-base md:hover:bg-brand-hover ' +
      'md:data-[selected]:bg-brand-100',
    lastSelected:
      'md:data-[selected]:!bg-red-200 md:data-[selected]:!text-white',
  },
  lg: {
    wrapper: 'lg:mb-2',
    separator: 'lg:border-b lg:border-gray-200',
    tab:
      'lg:mb-2 lg:w-full lg:rounded-xl lg:border-b-0 lg:px-4 lg:py-3 ' +
      'lg:text-left lg:text-base lg:hover:bg-brand-hover ' +
      'lg:data-[selected]:bg-brand-100',
    lastSelected:
      'lg:data-[selected]:!bg-red-200 lg:data-[selected]:!text-white',
  },
} as const;

export default function TabApp({
  text,
  last = false,
  disabled = false,
  breakpoint = 'md',
}: Props) {
  const v = VERTICAL[breakpoint];

  return (
    <div className={cn('shrink-0', v.wrapper, { [v.separator]: !last })}>
      <Tab
        key={text}
        className={cn(HORIZONTAL_TAB, v.tab, {
          'pointer-events-none text-gray-300': disabled,
          // Destructive tab: red underline in the strip, red pill on the rail.
          [cn(
            'text-red-400 data-[selected]:!text-red-500 data-[selected]:!border-red-400',
            v.lastSelected
          )]: last,
        })}
      >
        {text}
      </Tab>
    </div>
  );
}
