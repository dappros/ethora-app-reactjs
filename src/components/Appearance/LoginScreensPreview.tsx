import { useState } from 'react';
import YouLogo from '../../assets/YouLogo.svg';
import { useTranslation } from '../../i18n/useTranslation';
import { Segmented } from '../AIWidget/appearance/Fields';
import { DevicePreviewStage, PhoneStatusBar } from './DeviceFrames';
import { WelcomeArtwork } from './WelcomeArtwork';
import { DESKTOP_SCREEN, PHONE_SCREEN } from './deviceScreens';

type PreviewTheme = 'light' | 'dark';

interface Props {
  displayName: string;
  tagline: string;
  color: string;
  logoImage: string;
  url: string;
  welcomeTitle?: string;
  welcomeDescription?: string;
  welcomeImage?: string;
  welcomeImageFit?: 'cover' | 'contain';
  welcomeLayout?: 'split' | 'centered';
}

function palette(dark: boolean) {
  return dark
    ? {
        page: '#0f1117',
        card: '#1c1d22',
        input: '#16171b',
        text: '#ffffff',
        muted: '#9aa1b2',
      }
    : {
        page: '#f5f7f9',
        card: '#ffffff',
        input: '#f5f7f9',
        text: '#121219',
        muted: '#6b7280',
      };
}

function EyeOffIcon({ color }: { color: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.1A9.8 9.8 0 0 1 12 5c5 0 9 4.5 10 7a12 12 0 0 1-3 4.2M6.6 6.6A12.4 12.4 0 0 0 2 12c1 2.5 5 7 10 7a9.6 9.6 0 0 0 5.4-1.6" />
    </svg>
  );
}

function SignInForm({
  color,
  dark,
  compact,
}: {
  color: string;
  dark: boolean;
  compact?: boolean;
}) {
  const { t } = useTranslation();
  const p = palette(dark);
  const field = (label: string, eye?: boolean) => (
    <div
      className="flex items-center justify-between rounded-2xl font-sans"
      style={{
        background: p.input,
        color: p.muted,
        height: compact ? 60 : 64,
        padding: '0 20px',
        fontSize: 18,
      }}
    >
      {label}
      {eye && <EyeOffIcon color={p.text} />}
    </div>
  );
  return (
    <div className="flex flex-col" style={{ gap: compact ? 18 : 32 }}>
      {field(t('authLoginStep.emailPlaceholder'))}
      {field(t('authLoginStep.passwordPlaceholder'), true)}
      <span
        className="font-sans underline"
        style={{ color: p.text, fontSize: 16, marginTop: -8 }}
      >
        {t('authLoginStep.forgotPassword')}
      </span>
      <div
        className="grid place-items-center rounded-2xl font-varela text-white"
        style={{ background: color, height: compact ? 60 : 64, fontSize: 20 }}
      >
        {t('authLoginStep.submit')}
      </div>
    </div>
  );
}

function SignUpLine({ dark }: { dark: boolean }) {
  const { t } = useTranslation();
  return (
    <div
      className="text-center font-sans"
      style={{ fontSize: 16, color: palette(dark).text }}
    >
      {t('authLoginForm.noAccount')}{' '}
      <span className="underline">
        {t('authLoginForm.signUp')}
      </span>
    </div>
  );
}

function Logo({
  src,
  height,
  width = 320,
}: {
  src: string;
  height: number;
  width?: number;
}) {
  return (
    <img
      src={src || YouLogo}
      alt=""
      className="object-contain"
      style={{ maxHeight: height, maxWidth: width }}
    />
  );
}

function DesktopLogin({
  displayName,
  tagline,
  color,
  logoImage,
  welcomeTitle,
  welcomeDescription,
  welcomeImage,
  welcomeImageFit,
  welcomeLayout,
  dark,
}: Props & { dark: boolean }) {
  const { t } = useTranslation();
  const p = palette(dark);
  return (
    <div
      className="grid items-center"
      style={{
        ...DESKTOP_SCREEN,
        background: p.page,
        padding: '0 80px',
        gap: welcomeLayout === 'centered' ? 20 : 80,
        gridTemplateColumns: welcomeLayout === 'centered' ? 'minmax(0, 600px)' : 'repeat(2, minmax(0, 1fr))',
        justifyContent: 'center',
        alignContent: 'center',
      }}
    >
      <div className="flex flex-col items-center" style={{ gap: welcomeLayout === 'centered' ? 14 : 28 }}>
        <Logo src={logoImage} height={welcomeImage ? 56 : welcomeLayout === 'centered' ? 65 : 150} width={420} />
        {welcomeImage && <WelcomeArtwork key={welcomeImage} src={welcomeImage} fit={welcomeImageFit} className={welcomeLayout === 'centered' ? 'max-h-[145px] max-w-[440px]' : 'max-h-[300px]'} />}
        {welcomeTitle && <div className="text-center font-varela [overflow-wrap:anywhere]" style={{ fontSize: 32, color: p.text }}>{welcomeTitle}</div>}
        <div
          className="font-varela break-words whitespace-pre-wrap text-center"
          style={{ fontSize: 26, lineHeight: 1.4, color: p.text }}
        >
          {welcomeDescription || tagline ||
            `${displayName || ''}${t('authLogoContent.taglineSuffix')}`}
        </div>
      </div>
      <div
        className="flex flex-col rounded-3xl"
        style={{
          background: p.card,
          padding: welcomeLayout === 'centered' ? '20px 38px' : '32px 48px',
          gap: welcomeLayout === 'centered' ? 16 : 32,
          height: welcomeLayout === 'centered' ? undefined : 600,
        }}
      >
        <div
          className="text-center font-varela"
          style={{ fontSize: 30, color: p.text }}
        >
          {t('authLoginForm.title')}
        </div>
        <SignInForm color={color} dark={dark} compact={welcomeLayout === 'centered'} />
        <div className="mt-auto">
          <SignUpLine dark={dark} />
        </div>
      </div>
    </div>
  );
}

function MobileLogin({ color, logoImage, welcomeTitle, welcomeDescription, welcomeImage, welcomeImageFit, dark }: Props & { dark: boolean }) {
  const { t } = useTranslation();
  const p = palette(dark);
  return (
    <div
      className="flex flex-col"
      style={{ ...PHONE_SCREEN, background: p.card }}
    >
      <PhoneStatusBar color={p.text} />
      <div
        className="flex-1 flex flex-col justify-center"
        style={{ padding: '0 24px', gap: welcomeImage ? 14 : 24 }}
      >
        <div className="flex justify-center">
          <Logo src={logoImage} height={welcomeImage ? 54 : 84} />
        </div>
        <div
          className="text-center font-varela"
          style={{ fontSize: 30, color: p.text }}
        >
          {t('authLoginForm.title')}
        </div>
        {welcomeImage && <WelcomeArtwork key={welcomeImage} src={welcomeImage} fit={welcomeImageFit} className="max-h-[140px]" />}
        {welcomeTitle && <div className="text-center font-varela [overflow-wrap:anywhere]" style={{ fontSize: 24, color: p.text }}>{welcomeTitle}</div>}
        {welcomeDescription && <div className="break-words whitespace-pre-wrap text-center" style={{ fontSize: 16, color: p.muted }}>{welcomeDescription}</div>}
        <SignInForm color={color} dark={dark} compact />
        <div style={{ marginTop: 24 }}>
          <SignUpLine dark={dark} />
        </div>
      </div>
    </div>
  );
}

export function LoginScreensPreview(props: Props) {
  const { t } = useTranslation();
  const [theme, setTheme] = useState<PreviewTheme>('light');
  const dark = theme === 'dark';

  return (
    <div className="min-w-0">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="font-sans font-semibold text-sm">
          {t('appSettingsAppearance.previewHeading')}
        </div>
        <Segmented<PreviewTheme>
          ariaLabel={t('appSettingsAppearance.previewThemeLabel')}
          size="sm"
          value={theme}
          onChange={setTheme}
          options={[
            { value: 'light', label: t('appearance.themeLight') },
            { value: 'dark', label: t('appearance.themeDark') },
          ]}
        />
      </div>
      <DevicePreviewStage
        url={props.url}
        dark={dark}
        desktop={<DesktopLogin {...props} dark={dark} />}
        phone={<MobileLogin {...props} dark={dark} />}
      />
    </div>
  );
}
