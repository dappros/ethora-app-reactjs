import { Box, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useTranslation } from '../../i18n/useTranslation';
import AuthScreenBody from '../../pages/AuthPage/AuthScreenBody';
import { authCardTitleSx, isStackedAuthLayout } from '../../pages/AuthPage/authLayout';
import CustomButton from '../../pages/AuthPage/Button';
import SignInCard from '../../pages/AuthPage/Forms/SignInCard';
import LogoContent, { type LogoContentApp } from '../../pages/AuthPage/LogoContent';
import Wrapper from '../../pages/AuthPage/Wrapper';
import { Segmented } from '../AIWidget/appearance/Fields';
import { DevicePreviewStage, PhoneStatusBar } from './DeviceFrames';
import { DESKTOP_SCREEN, PHONE_SCREEN } from './deviceScreens';

type PreviewTheme = 'light' | 'dark';

interface Props {
  displayName: string;
  tagline: string;
  color: string;
  logoImage: string;
  url: string;
  isBaseApp?: boolean;
  welcomeTitle?: string;
  welcomeDescription?: string;
  welcomeImage?: string;
  welcomeImageFit?: 'cover' | 'contain';
  welcomeLayout?: 'split' | 'centered';
}

const DEFAULT_BRAND = '#0052CD';

// The theme tokens the sign-in page reads (see index.css), set on the preview
// root so its light / dark switch works whatever theme the admin panel uses.
const THEME_TOKENS: Record<PreviewTheme, Record<string, string>> = {
  light: {
    '--c-page': '245 247 249',
    '--c-surface': '255 255 255',
    '--c-fg': '18 18 25',
    '--c-gray-100': '245 247 249',
    '--c-gray-500': '140 140 140',
    '--c-gray-950': '20 20 20',
    '--c-brand-50': '243 244 252',
  },
  dark: {
    '--c-page': '15 17 21',
    '--c-surface': '26 28 33',
    '--c-fg': '236 238 241',
    '--c-gray-100': '21 23 28',
    '--c-gray-500': '148 155 165',
    '--c-gray-950': '245 246 248',
    '--c-brand-50': '30 35 50',
  },
};

function brandColor(color: string): string {
  return /^#[0-9a-f]{6}$/i.test(color) ? color : DEFAULT_BRAND;
}

function EyeOffIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="rgb(var(--c-gray-950))"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.1A9.8 9.8 0 0 1 12 5c5 0 9 4.5 10 7a12 12 0 0 1-3 4.2M6.6 6.6A12.4 12.4 0 0 0 2 12c1 2.5 5 7 10 7a9.6 9.6 0 0 0 5.4-1.6" />
    </svg>
  );
}

// Static stand-in for the sign-in card's contents (Forms/LoginForm.tsx and
// Login/Steps/LoginForm.tsx): same title, field, link and button styles,
// without the live form's state and sign-in buttons.
function SignInCardContent({ color }: { color: string }) {
  const { t } = useTranslation();
  const field = (label: string, eye?: boolean) => (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: '16px',
        backgroundColor: 'rgb(var(--c-gray-100))',
        color: 'rgb(var(--c-gray-500))',
        fontSize: 16,
        minHeight: 48,
        padding: '0 16px',
      }}
    >
      {label}
      {eye && <EyeOffIcon />}
    </Box>
  );
  return (
    <>
      <Box sx={{ display: 'flex', gap: '24px', flexDirection: 'column' }}>
        <Typography variant="h4" align="center" sx={authCardTitleSx}>
          {t('authLoginForm.title')}
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {field(t('authLoginStep.emailPlaceholder'))}
          {field(t('authLoginStep.passwordPlaceholder'), true)}
          <span
            className="self-start text-sm font-medium underline underline-offset-2"
            style={{ color }}
          >
            {t('authLoginStep.forgotPassword')}
          </span>
          <CustomButton fullWidth tabIndex={-1} style={{ backgroundColor: color }}>
            {t('authLoginStep.submit')}
          </CustomButton>
        </Box>
      </Box>
      <Typography align="center" component="span" fontSize="14px" sx={{ color: 'rgb(var(--c-fg))' }}>
        {t('authLoginForm.noAccount')}{' '}
        <span className="font-medium underline underline-offset-2" style={{ color }}>
          {t('authLoginForm.signUp')}
        </span>
      </Typography>
    </>
  );
}

// One sign-in screen, built from the same components as the live login page
// (Wrapper, AuthScreenBody, LogoContent, SignInCard) at the frame's size.
function SignInScreen({
  props,
  dark,
  isMobile,
}: {
  props: Props;
  dark: boolean;
  isMobile: boolean;
}) {
  const color = brandColor(props.color);
  const app: LogoContentApp = {
    displayName: props.displayName,
    logoImage: props.logoImage,
    appTagline: props.tagline,
    isBaseApp: props.isBaseApp,
    welcomeTitle: props.welcomeTitle,
    welcomeDescription: props.welcomeDescription,
    welcomeImage: props.welcomeImage,
    welcomeImageFit: props.welcomeImageFit,
    welcomeLayout: props.welcomeLayout,
  };
  const stacked = isStackedAuthLayout(app, isMobile);
  return (
    <Wrapper
      isMobile={isMobile}
      primaryColor={color}
      footer={false}
      style={{
        width: '100%',
        minHeight: 0,
        flex: 1,
        overflow: 'hidden',
        // The rings are dropped in dark mode on the live page too.
        ...(dark ? { backgroundImage: 'none' } : {}),
      }}
    >
      <AuthScreenBody stacked={stacked} isMobile={isMobile}>
        <LogoContent app={app} isMobile={isMobile} centered={stacked} welcome />
        <SignInCard isMobile={isMobile} hug={stacked}>
          <SignInCardContent color={color} />
        </SignInCard>
      </AuthScreenBody>
    </Wrapper>
  );
}

function themeStyle(dark: boolean, color: string): React.CSSProperties {
  return {
    ...THEME_TOKENS[dark ? 'dark' : 'light'],
    // The App's brand colour, as App.tsx sets it on the live page.
    '--bg-brand-primary': brandColor(color),
    backgroundColor: 'rgb(var(--c-page))',
    color: 'rgb(var(--c-fg))',
  } as React.CSSProperties;
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
        desktop={
          <div
            data-testid="signin-preview-desktop"
            aria-hidden="true"
            // A picture of the page: nothing in it can take focus.
            {...{ inert: '' }}
            className="pointer-events-none select-none flex flex-col"
            style={{ ...DESKTOP_SCREEN, ...themeStyle(dark, props.color) }}
          >
            <SignInScreen props={props} dark={dark} isMobile={false} />
          </div>
        }
        phone={
          <div
            data-testid="signin-preview-phone"
            aria-hidden="true"
            // A picture of the page: nothing in it can take focus.
            {...{ inert: '' }}
            className="pointer-events-none select-none flex flex-col"
            style={{ ...PHONE_SCREEN, ...themeStyle(dark, props.color), backgroundColor: 'rgb(var(--c-surface))' }}
          >
            <PhoneStatusBar color={dark ? '#ffffff' : '#121219'} />
            <SignInScreen props={props} dark={dark} isMobile />
          </div>
        }
      />
    </div>
  );
}
