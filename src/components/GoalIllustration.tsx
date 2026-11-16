import { OnboardingIntent } from '../utils/onboardingIntent';

// Schematic drawings for the onboarding goals (start screen, "What is this
// app for?" on App Home). Colours come from theme tokens so dark mode
// follows: l = neutral line, s = soft brand fill, a = brand fill,
// al = brand line, w = card background.
const l = 'fill-none stroke-gray-400 [stroke-width:2] [stroke-linecap:round] [stroke-linejoin:round]';
const s = 'fill-brand-50';
const a = 'fill-brand-500';
const al = 'fill-none stroke-brand-500 [stroke-width:2.2] [stroke-linecap:round] [stroke-linejoin:round]';
const w = 'fill-surface';

const LABELS: Record<OnboardingIntent, string> = {
  website: 'A website with a chat assistant in the corner',
  sdk: 'A phone app with chat messages and a call button, next to code',
  messenger: 'A messenger on a laptop and a phone, with people in a group',
  selfHost: 'Your own server with a lock',
};

function Drawing({ goal }: { goal: OnboardingIntent }) {
  switch (goal) {
    case 'website':
      return (
        <>
          <rect className={s} x="14" y="10" width="132" height="76" rx="8" />
          <rect className={l} x="14" y="10" width="132" height="76" rx="8" />
          <path className={l} d="M14 26h132" />
          <circle className={l} cx="24" cy="18" r="1.6" />
          <circle className={l} cx="31" cy="18" r="1.6" />
          <circle className={l} cx="38" cy="18" r="1.6" />
          <path className={l} d="M26 40h46M26 50h34M26 60h40" />
          <rect className={w} x="84" y="36" width="50" height="28" rx="7" />
          <rect className={al} x="84" y="36" width="50" height="28" rx="7" />
          <path className={al} d="M93 46h32M93 54h20" />
          <circle className={a} cx="126" cy="74" r="8" />
          <path d="M122.5 72.5h7M122.5 75.8h4.4" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
        </>
      );
    case 'sdk':
      return (
        <>
          <rect className={s} x="22" y="8" width="46" height="80" rx="9" />
          <rect className={l} x="22" y="8" width="46" height="80" rx="9" />
          <path className={l} d="M39 14h12" />
          <rect className={l} x="29" y="24" width="24" height="10" rx="5" />
          <rect className={a} x="37" y="40" width="24" height="10" rx="5" />
          <rect className={l} x="29" y="56" width="18" height="10" rx="5" />
          <circle className={al} cx="45" cy="77" r="5.5" />
          <path className={al} d="M92 34l-12 14 12 14M118 34l12 14-12 14M110 28l-10 40" />
          <path className={l} d="M72 48h4" />
        </>
      );
    case 'messenger':
      return (
        <>
          <rect className={s} x="12" y="14" width="96" height="60" rx="6" />
          <rect className={l} x="12" y="14" width="96" height="60" rx="6" />
          <path className={l} d="M4 82h112M42 14v60" />
          <circle className={l} cx="24" cy="27" r="4" />
          <path className={l} d="M32 27h4" />
          <circle className={a} cx="24" cy="43" r="4" />
          <path className={al} d="M32 43h4" />
          <circle className={l} cx="24" cy="59" r="4" />
          <path className={l} d="M32 59h4" />
          <rect className={l} x="50" y="24" width="30" height="9" rx="4.5" />
          <rect className={a} x="68" y="39" width="32" height="9" rx="4.5" />
          <rect className={l} x="50" y="54" width="24" height="9" rx="4.5" />
          <rect className={w} x="118" y="30" width="32" height="58" rx="7" />
          <rect className={l} x="118" y="30" width="32" height="58" rx="7" />
          <rect className={l} x="124" y="42" width="16" height="7" rx="3.5" />
          <rect className={a} x="128" y="54" width="16" height="7" rx="3.5" />
          <rect className={l} x="124" y="66" width="12" height="7" rx="3.5" />
        </>
      );
    case 'selfHost':
      return (
        <>
          <rect className={s} x="30" y="12" width="84" height="22" rx="6" />
          <rect className={l} x="30" y="12" width="84" height="22" rx="6" />
          <rect className={l} x="30" y="38" width="84" height="22" rx="6" />
          <rect className={l} x="30" y="64" width="84" height="22" rx="6" />
          <circle className={a} cx="42" cy="23" r="2.6" />
          <circle className={l} cx="42" cy="49" r="2.6" />
          <circle className={l} cx="42" cy="75" r="2.6" />
          <path className={l} d="M54 23h30M54 49h30M54 75h30" />
          <rect className={w} x="100" y="50" width="34" height="30" rx="7" />
          <rect className={al} x="100" y="50" width="34" height="30" rx="7" />
          <path className={al} d="M109 50v-6a8 8 0 0 1 16 0v6" />
          <circle className={a} cx="117" cy="63" r="3" />
          <path className={al} d="M117 66v5" />
        </>
      );
  }
}

export function GoalIllustration({ goal, className = '' }: { goal: OnboardingIntent; className?: string }) {
  return (
    <svg viewBox="0 0 160 96" role="img" aria-label={LABELS[goal]} className={`mb-3 block h-auto max-h-[108px] w-full ${className}`}>
      <Drawing goal={goal} />
    </svg>
  );
}
