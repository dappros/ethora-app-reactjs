import { Box, Typography } from '@mui/material';
import React, { useMemo, useState } from 'react';
import { WelcomeArtwork } from '../../components/Appearance/WelcomeArtwork';
import YouLogo from '../../assets/YouLogo.svg';
import type { ModelApp } from '../../models';
import { useAppStore } from '../../store/useAppStore';
import { useTranslation } from '../../i18n/useTranslation';
import { hasWelcomeScreen } from './authLayout';

import { env } from '../../config/env';

// The App fields this column reads. The sign-in screen preview passes the
// unsaved values from Settings > Appearance; the live pages read the store.
export type LogoContentApp = Pick<ModelApp, 'displayName' | 'logoImage' | 'appTagline'> &
  Partial<
    Pick<
      ModelApp,
      | 'isBaseApp'
      | 'welcomeTitle'
      | 'welcomeDescription'
      | 'welcomeImage'
      | 'welcomeImageFit'
      | 'welcomeLayout'
    >
  >;

interface LogoContentProps {
  isMobile?: boolean;
  // Center the column (stacked layouts). Defaults to isMobile.
  centered?: boolean;
  // Show the App's welcome screen (image, heading, message) when it has one.
  welcome?: boolean;
  // Overrides the current App from the store (the Appearance preview).
  app?: LogoContentApp;
}

// Bounded so a large logo never overflows the screen (phones included).
const logoStyle: React.CSSProperties = {
  display: 'block',
  width: 'auto',
  height: 'auto',
  maxWidth: '100%',
  maxHeight: 'min(30vh, 240px)',
  objectFit: 'contain',
};

// Smaller logo when it shares the column with a welcome image, or sits above
// the form in the centered layout.
const compactLogoStyle: React.CSSProperties = {
  ...logoStyle,
  maxHeight: 'min(14vh, 112px)',
};

const LogoContent: React.FC<LogoContentProps> = ({
  isMobile = false,
  centered: centeredProp,
  welcome = false,
  app,
}) => {
  const storeApp = useAppStore((s) => s.currentApp);
  const config: LogoContentApp | null = app ?? storeApp;
  const [imageError, setImageError] = useState(false);
  const { t } = useTranslation();

  const centered = centeredProp ?? isMobile;
  // Without welcome fields the column renders exactly as it always has.
  const showWelcome = welcome && hasWelcomeScreen(config);
  const compactLogo = showWelcome && (centered || Boolean(config?.welcomeImage));
  const imgStyle = compactLogo ? compactLogoStyle : logoStyle;

  const allowedDomains =
    env.VITE_APP_ALLOWED_DOMAINS?.split(',') || [];
  const currentDomain = window.location.hostname;

  // if (!allowedDomains.includes(currentDomain)) {
  //   return;
  // }

  const logoImage = useMemo(() => {
    if (showWelcome && config && !config.isBaseApp && (imageError || !config.logoImage)) {
      const initials = (config.displayName || '').trim().split(/\s+/).slice(0, 2).map((word) => word[0]).join('').toUpperCase();
      return <span aria-hidden="true" className="grid size-16 place-items-center rounded-2xl bg-brand-50 text-xl font-semibold text-brand-500">{initials || 'E'}</span>;
    }
    if (imageError || !config?.logoImage) {
      return (
        <img
          alt={t('authLogoContent.logoAlt')}
          src={YouLogo}
          onError={() => setImageError(true)}
          style={imgStyle}
        />
      );
    }

    if (allowedDomains.includes(currentDomain)) {
      return (
        <a href="https://ethora.com/" target="_blank" rel="noopener noreferrer">
          <img
            alt={t('authLogoContent.logoAlt')}
            src={config.logoImage}
            onError={() => setImageError(true)}
            style={imgStyle}
          />
        </a>
      );
    }

    return (
      <img
        alt={t('authLogoContent.logoAlt')}
        src={config.logoImage}
        onError={() => setImageError(true)}
        style={imgStyle}
      />
    );
    // `t` is a dep: the memo renders translated alt text, so it must
    // recompute when the app language changes (useTranslation returns a new
    // `t` bound to the active locale).
  }, [config?.logoImage, config?.isBaseApp, config?.displayName, imageError, t, showWelcome, imgStyle]);

  if (!config) return null;

  const welcomeMessage = showWelcome ? config.welcomeDescription?.trim() : '';
  const showText = !isMobile || Boolean(welcomeMessage);

  return (
    <Box
      sx={
        showWelcome
          ? {
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              minWidth: 0,
              maxWidth: centered ? 480 : undefined,
              paddingInline: isMobile ? '16px' : 0,
              textAlign: 'left',
              justifyContent: 'center',
              gap: centered ? 2 : 3,
            }
          : {
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              minWidth: 0,
              textAlign: 'left',
              justifyContent: 'center',
              gap: 5,
            }
      }
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: centered ? 'center' : 'flex-start',
          textAlign: centered ? 'center' : 'start',
        }}
      >
        {logoImage}
      </Box>

      {showWelcome && config.welcomeImage && (
        <WelcomeArtwork
          key={config.welcomeImage}
          src={config.welcomeImage}
          fit={config.welcomeImageFit}
          className={isMobile ? 'max-h-40' : centered ? 'max-h-[240px]' : 'max-h-[300px]'}
        />
      )}

      {showWelcome && config.welcomeTitle?.trim() && (
        <Typography
          component="h1"
          data-testid="welcome-title"
          sx={{
            fontFamily: '"Varela Round", system-ui, sans-serif',
            fontSize: isMobile ? '24px' : 'clamp(24px, 3vw, 36px)',
            lineHeight: 1.15,
            color: 'rgb(var(--c-gray-950))',
            textAlign: centered ? 'center' : 'left',
            overflowWrap: 'anywhere',
          }}
        >
          {config.welcomeTitle}
        </Typography>
      )}

      {showText && (
        <Typography
          data-testid={welcomeMessage ? 'welcome-message' : undefined}
          sx={{
            fontFamily: '"Varela Round", system-ui, sans-serif',
            fontWeight: 400,
            fontSize: isMobile ? '16px' : 'clamp(18px, 2vw, 24px)',
            color: 'rgb(var(--c-gray-950))',
            lineHeight: 1.4,
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
            ...(showWelcome ? { whiteSpace: 'pre-wrap' } : {}),
            textAlign: centered ? 'center' : 'left',
          }}
        >
          {welcomeMessage ||
            config.appTagline ||
            `${config.displayName || ''}${t('authLogoContent.taglineSuffix')}`}
        </Typography>
      )}
    </Box>
  );
};

export default LogoContent;
