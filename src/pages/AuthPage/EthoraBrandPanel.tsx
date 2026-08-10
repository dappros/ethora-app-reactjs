import { Box, Typography } from '@mui/material';
import React, { useState } from 'react';
import YouLogo from '../../assets/YouLogo.svg';
import { useTranslation } from '../../i18n/useTranslation';
import { useAppStore } from '../../store/useAppStore';

// Left-side branded panel of the Ethora login screen (shown only on the
// ethora.com domains, see Login/index.tsx). Blue gradient background with the
// white logo, tagline, a static chat mockup and trust indicators.
const EthoraBrandPanel: React.FC = () => {
  const config = useAppStore((s) => s.currentApp);
  const [imageError, setImageError] = useState(false);
  const { t } = useTranslation();

  if (!config) return null;

  const logoSrc = imageError || !config.logoImage ? YouLogo : config.logoImage;

  const codeChipSx = {
    fontFamily: 'monospace',
    fontSize: '0.9em',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: '6px',
    padding: '1px 6px',
    whiteSpace: 'nowrap',
  } as const;

  return (
    <Box
      sx={{
        width: '50%',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        // Vertical rhythm scales with the viewport height so the panel keeps
        // fitting on short screens (laptops at 100% zoom, split windows)
        // instead of growing past 100vh.
        gap: 'clamp(16px, 3vh, 32px)',
        padding: 'clamp(24px, 5vh, 48px) 56px',
        background: 'linear-gradient(135deg, #3D8BE8 0%, #0A4FC0 100%)',
        color: 'white',
        fontFamily: 'Varela Round',
        // This panel is decorative - it must never scroll. The compacting
        // rules above (plus the two height media queries below) keep the
        // content inside 100vh; anything that still doesn't fit is dropped
        // rather than turned into a scrollbar.
        overflow: 'hidden',
        minHeight: 0,
      }}
    >
      <Box>
        <a href="https://ethora.com/" target="_blank" rel="noopener noreferrer">
          <img
            alt={t('authLogoContent.logoAlt')}
            src={logoSrc}
            onError={() => setImageError(true)}
            style={{
              height: '56px',
              maxWidth: '260px',
              objectFit: 'contain',
              // The stock logo is blue-on-transparent; render it white on the
              // blue panel without needing a separate asset.
              filter: 'brightness(0) invert(1)',
            }}
          />
        </a>

        <Typography
          sx={{
            fontFamily: 'Varela Round',
            fontWeight: 400,
            fontSize: 'clamp(32px, 3.2vw, 48px)',
            lineHeight: 1.25,
            color: 'white',
            marginTop: 'clamp(16px, 4vh, 48px)',
            maxWidth: '560px',
            wordBreak: 'break-word',
          }}
        >
          {config?.appTagline
            ? config.appTagline
            : `${config.displayName || ''}${t('authLogoContent.taglineSuffix')}`}
        </Typography>

        <Typography
          sx={{
            fontFamily: 'Varela Round',
            fontSize: '18px',
            lineHeight: 1.5,
            color: 'rgba(255, 255, 255, 0.9)',
            marginTop: 'clamp(12px, 2vh, 24px)',
            maxWidth: '520px',
          }}
        >
          {t('authBrandPanel.subtitle')}
        </Typography>
      </Box>

      <Box
        sx={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0px 12px 32px rgba(0, 0, 0, 0.18)',
          maxWidth: '600px',
          width: '100%',
          color: '#141414',
          // ~250px of fixed-height decoration. Below this the tagline and
          // subtitle alone fill the panel, so drop the mockup instead of
          // letting it push the content out of the viewport.
          '@media (max-height: 700px)': { display: 'none' },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '14px 20px',
            borderBottom: '1px solid #ECEFF3',
          }}
        >
          <Box sx={{ display: 'flex', gap: '6px' }}>
            {['#FF5F57', '#FEBC2E', '#28C840'].map((dot) => (
              <Box
                key={dot}
                sx={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: dot,
                }}
              />
            ))}
          </Box>
          <Typography
            sx={{
              fontFamily: 'Varela Round',
              fontSize: '14px',
              color: '#141414',
              marginLeft: '8px',
            }}
          >
            {t('authBrandPanel.chatChannel')}
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            padding: '20px',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Box
              sx={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: '#2F6FD9',
                flexShrink: 0,
              }}
            />
            <Box
              sx={{
                backgroundColor: '#F1F3F5',
                borderRadius: '16px',
                padding: '10px 16px',
                fontSize: '15px',
                lineHeight: 1.4,
              }}
            >
              {t('authBrandPanel.chatQuestion')}
            </Box>
          </Box>

          <Box
            sx={{
              backgroundColor: '#3D85DD',
              color: 'white',
              borderRadius: '16px',
              padding: '12px 18px',
              fontSize: '15px',
              lineHeight: 1.5,
              maxWidth: '85%',
            }}
          >
            {t('authBrandPanel.chatAnswerPart1')}{' '}
            <Box component="span" sx={codeChipSx}>
              @ethora/chat
            </Box>{' '}
            {t('authBrandPanel.chatAnswerPart2')}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Box sx={{ display: 'flex', gap: '4px' }}>
              {[0, 1, 2].map((i) => (
                <Box
                  key={i}
                  sx={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: '#9AA4B2',
                    animation: 'ethoraTypingPulse 1.2s ease-in-out infinite',
                    animationDelay: `${i * 0.2}s`,
                    '@keyframes ethoraTypingPulse': {
                      '0%, 60%, 100%': { opacity: 0.35 },
                      '30%': { opacity: 1 },
                    },
                  }}
                />
              ))}
            </Box>
            <Typography
              sx={{
                fontFamily: 'Varela Round',
                fontSize: '13px',
                color: '#8A94A1',
              }}
            >
              {t('authBrandPanel.aiTyping')}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          fontSize: '14px',
          color: 'rgba(255, 255, 255, 0.85)',
          flexShrink: 0,
          // Last thing to go on very short viewports (short split windows,
          // browser zoomed in).
          '@media (max-height: 480px)': { display: 'none' },
        }}
      >
        <span>{t('authBrandPanel.trustedBy')}</span>
        <Box
          sx={{
            width: '1px',
            height: '16px',
            backgroundColor: 'rgba(255, 255, 255, 0.4)',
          }}
        />
        <span>{t('authBrandPanel.uptime')}</span>
      </Box>
    </Box>
  );
};

export default EthoraBrandPanel;
