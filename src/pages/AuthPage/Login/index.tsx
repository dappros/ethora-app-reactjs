import { Box, useMediaQuery, useTheme } from '@mui/material';
import { useState } from 'react';
import { useAppStore } from '../../../store/useAppStore';
import SignInForm from '../Forms/LoginForm';
import { FullPageSpinner } from '../FullPageSpinner';
import LogoContent from '../LogoContent';
import Wrapper from '../Wrapper';

export default function LoginComponent() {
  const config = useAppStore((s) => s.currentApp);

  if (!config) {
    return null;
  }

  const [loading] = useState(false);

  const theme = useTheme();
  const isMobileDevice = useMediaQuery(theme.breakpoints.down(1024));

  if (loading) {
    return <FullPageSpinner />;
  }

  return (
    <Wrapper>
      <Box
        sx={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flex: 1,
          flexDirection: isMobileDevice ? 'column' : 'row',
          gap: isMobileDevice ? '20px' : '16px',
          alignItems: 'center',
        }}
      >
        <LogoContent isMobile={isMobileDevice} />
        <SignInForm isMobile={isMobileDevice} />
      </Box>
    </Wrapper>
  );
}
