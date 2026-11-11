import { Box, Typography } from '@mui/material';
import React, { useMemo, useState } from 'react';
import { WelcomeArtwork } from '../../components/Appearance/WelcomeArtwork';
import YouLogo from '../../assets/YouLogo.svg';
import { useAppStore } from '../../store/useAppStore';
import { useTranslation } from '../../i18n/useTranslation';

import { env } from '../../config/env';
interface LogoContentProps {
  isMobile?: boolean;
  welcome?: boolean;
}

const logoStyle: React.CSSProperties = {
  display: 'block',
  width: 'auto',
  height: 'auto',
  maxWidth: '100%',
  maxHeight: 'min(30vh, 240px)',
  objectFit: 'contain',
};

const LogoContent: React.FC<LogoContentProps> = ({ isMobile = false, welcome = false }) => {
  const config = useAppStore((s) => s.currentApp);
  const [imageError, setImageError] = useState(false);
  const { t } = useTranslation();

  const allowedDomains =
    env.VITE_APP_ALLOWED_DOMAINS?.split(',') || [];
  const currentDomain = window.location.hostname;

  // if (!allowedDomains.includes(currentDomain)) {
  //   return;
  // }

  const logoImage = useMemo(() => {
    if (welcome && config && !config.isBaseApp && (imageError || !config.logoImage)) {
      const initials = (config.displayName || '').trim().split(/\s+/).slice(0, 2).map((word) => word[0]).join('').toUpperCase();
      return <span aria-hidden="true" className="grid size-16 place-items-center rounded-2xl bg-brand-50 text-xl font-semibold text-brand-500">{initials || 'E'}</span>;
    }
    if (imageError || !config?.logoImage) {
      return (
        <img
          alt={t('authLogoContent.logoAlt')}
          src={YouLogo}
          onError={() => setImageError(true)}
          style={logoStyle}
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
            style={logoStyle}
          />
        </a>
      );
    }

    return (
      <img
        alt={t('authLogoContent.logoAlt')}
        src={config.logoImage}
        onError={() => setImageError(true)}
        style={logoStyle}
      />
    );
    // `t` is a dep: the memo renders translated alt text, so it must
    // recompute when the app language changes (useTranslation returns a new
    // `t` bound to the active locale).
  }, [config?.logoImage, config?.isBaseApp, config?.displayName, imageError, t, welcome]);

  if (!config) return null;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        minWidth: 0,
        maxWidth: isMobile ? 480 : undefined,
        paddingInline: isMobile ? '16px' : 0,
        textAlign: 'left',
        justifyContent: 'center',
        gap: isMobile ? 2 : 3,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: isMobile ? 'center' : 'flex-start',
          textAlign: isMobile ? 'center' : 'start',
        }}
      >
        {logoImage}
      </Box>

      {welcome && config.welcomeImage && <WelcomeArtwork key={config.welcomeImage} src={config.welcomeImage} fit={config.welcomeImageFit} className={isMobile ? 'max-h-40' : 'max-h-[300px]'} />}

      {welcome && config.welcomeTitle && (
        <Typography component="h1" sx={{ fontFamily: '"Varela Round", system-ui, sans-serif', fontSize: 'clamp(24px, 3vw, 36px)', lineHeight: 1.15, textAlign: isMobile ? 'center' : 'left', overflowWrap: 'anywhere' }}>
          {config.welcomeTitle}
        </Typography>
      )}
      {(!isMobile || (welcome && config.welcomeDescription)) && (
        <Typography
          sx={{
            fontFamily: '"Varela Round", system-ui, sans-serif',
            fontWeight: 400,
            fontSize: isMobile ? '16px' : 'clamp(18px, 2vw, 24px)',
            color: 'rgb(var(--c-gray-950))',
            lineHeight: 1.4,
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
            whiteSpace: 'pre-wrap',
            textAlign: isMobile ? 'center' : 'left',
          }}
        >
          {(welcome && config.welcomeDescription) || config.appTagline ||
            `${config.displayName || ''}${t('authLogoContent.taglineSuffix')}`}
        </Typography>
      )}
    </Box>
  );
};

export default LogoContent;
