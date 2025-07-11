import { Box, Typography } from '@mui/material';
import React, { useMemo, useState } from 'react';
import YouLogo from '../../assets/YouLogo.svg';
import { useAppStore } from '../../store/useAppStore';

interface LogoContentProps {
  isMobile?: boolean;
}

const LogoContent: React.FC<LogoContentProps> = ({ isMobile = false }) => {
  const config = useAppStore((s) => s.currentApp);
  const [imageError, setImageError] = useState(false);

  const allowedDomains =
    import.meta.env.VITE_APP_ALLOWED_DOMAINS?.split(',') || [];
  const currentDomain = window.location.hostname;

  // if (!allowedDomains.includes(currentDomain)) {
  //   return;
  // }

  console.log('allowedDomains', allowedDomains);
  console.log(
    'allowedDomains.includes(currentDomain)',
    allowedDomains.includes(currentDomain)
  );

  const logoImage = useMemo(() => {
    if (imageError || !config?.logoImage) {
      return (
        <img
          alt="logoImage"
          src={YouLogo}
          onError={() => setImageError(true)}
          style={{ maxWidth: '100%' }}
        />
      );
    }

    if (allowedDomains.includes(currentDomain)) {
      return (
        <a href="https://ethora.com/" target="_blank" rel="noopener noreferrer">
          <img
            alt="logoImage"
            src={config.logoImage}
            onError={() => setImageError(true)}
            style={{ maxWidth: '100%' }}
          />
        </a>
      );
    }

    return (
      <img
        alt="logoImage"
        src={config.logoImage}
        onError={() => setImageError(true)}
        style={{ maxWidth: '100%' }}
      />
    );
  }, [config?.logoImage, imageError]);

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
        gap: 5,
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
            fontSize: 48,
            color: '#141414',
            lineHeight: '56px',
            height: '112px',
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
            textAlign: 'left',
          }}
        >
          {config?.appTagline
            ? config.appTagline
            : `${config.displayName || ''}: join our community`}
        </Typography>
      )}
    </Box>
  );
};

export default LogoContent;
