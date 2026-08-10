import { Box, useMediaQuery } from '@mui/material';
import { Theme, useTheme } from '@mui/system';
import React, { ReactNode } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { BuildVersionFooter } from '../../components/BuildVersionFooter';
import './Wrapper.scss';
import { hexToRGBA } from './hetToRgba';

interface WrapperProps {
  children: ReactNode;
}

const Wrapper: React.FC<WrapperProps> = ({ children }) => {
  const theme: Theme = useTheme();
  const isMobileDevice = useMediaQuery(theme.breakpoints.down(1024));
  const config = useAppStore((s) => s.currentApp);

  return (
    <Box
      sx={{
        display: 'flex',
        color: '#141414',
        padding: isMobileDevice ? '24px 0px' : '5.5% 10%',
        backgroundImage: isMobileDevice ? 'none !important' : '',
        backgroundColor: !isMobileDevice
          ? config?.primaryColor
            ? hexToRGBA(config.primaryColor)
            : hexToRGBA('#0052CD')
          : 'white',
      }}
      className="responsiveWrapper"
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
        <BuildVersionFooter />
      </Box>
    </Box>
  );
};

export default Wrapper;
