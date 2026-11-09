import { Box, Typography } from '@mui/material';
import React, { useMemo, useState } from 'react';
import YouLogo from '../../assets/YouLogo.svg';
import { useAppStore } from '../../store/useAppStore';
import { useTranslation } from '../../i18n/useTranslation';

import { env } from '../../config/env';
interface LogoContentProps {
  isMobile?: boolean;
}

const logoStyle: React.CSSProperties = {
  display: 'block',
  width: 'auto',
  height: 'auto',
  maxWidth: '100%',
  maxHeight: 'min(30vh, 240px)',
  objectFit: 'contain',
};

const LogoContent: React.FC<LogoContentProps> = ({ isMobile = false }) => {
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
  }, [config?.logoImage, imageError, t]);

  if (!config) return null;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        minWidth: 221,
        textAlign: 'left',
        justifyContent: 'center',
        gap: 3,
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

      {!isMobile && (
        <Typography
          sx={{
            fontFamily: 'Varela Round',
            fontWeight: 400,
            fontSize: 'clamp(20px, 2vw, 26px)',
            color: 'rgb(var(--c-gray-950))',
            lineHeight: 1.4,
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
            textAlign: 'left',
          }}
        >
          {config?.appTagline
            ? config.appTagline
            : `${config.displayName || ''}${t('authLogoContent.taglineSuffix')}`}
        </Typography>
      )}
    </Box>
  );
};

export default LogoContent;
