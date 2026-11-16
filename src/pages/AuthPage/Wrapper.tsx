import { Box, useMediaQuery } from '@mui/material';
import { Theme, useTheme } from '@mui/system';
import React, { ReactNode } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { BuildVersionFooter } from '../../components/BuildVersionFooter';
import './Wrapper.scss';
import { hexToRGBA } from './hetToRgba';

interface WrapperProps {
  children: ReactNode;
  // Overrides for the sign-in screen preview in Settings > Appearance, which
  // draws this page inside a device frame: the frame's layout instead of the
  // viewport's, the unsaved brand colour, frame-sized styles and no footer.
  isMobile?: boolean;
  primaryColor?: string;
  style?: React.CSSProperties;
  footer?: boolean;
}

const Wrapper: React.FC<WrapperProps> = ({
  children,
  isMobile,
  primaryColor,
  style,
  footer = true,
}) => {
  const theme: Theme = useTheme();
  const isMobileViewport = useMediaQuery(theme.breakpoints.down(1024));
  const isMobileDevice = isMobile ?? isMobileViewport;
  const config = useAppStore((s) => s.currentApp);
  const brandColor = primaryColor !== undefined ? primaryColor : config?.primaryColor;

  return (
    <Box
      sx={{
        display: 'flex',
        color: 'rgb(var(--c-gray-950))',
        padding: isMobileDevice ? '24px 0px' : '5.5% 10%',
        backgroundImage: isMobileDevice ? 'none !important' : '',
        backgroundColor: !isMobileDevice
          ? brandColor
            ? hexToRGBA(brandColor)
            : hexToRGBA('#0052CD')
          : 'rgb(var(--c-surface))',
      }}
      className="responsiveWrapper"
      style={style}
    >
      <Box
        sx={{
          display: 'flex',
          width: '100%',
          // minHeight (not height) so a form taller than the viewport grows
          // the column instead of spilling out of it - the auto-margin
          // centering in Login/Register then degrades to top-aligned.
          minHeight: '100%',
          gap: '24px',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
        }}
      >
        {children}
        {/* Tiny build/version line at the bottom of every auth screen so QA / ops can
            tell at a glance what's deployed. Falls back to nothing if no info is set. */}
        {footer && <BuildVersionFooter />}
      </Box>
    </Box>
  );
};

export default Wrapper;
