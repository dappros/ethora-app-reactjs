import { Box, useMediaQuery, useTheme } from '@mui/material';
import { useState } from 'react';
import { BuildVersionFooter } from '../../../components/BuildVersionFooter';
import { useAppStore } from '../../../store/useAppStore';
import EthoraBrandPanel from '../EthoraBrandPanel';
import SignInForm from '../Forms/LoginForm';
import { FullPageSpinner } from '../FullPageSpinner';
import LogoContent from '../LogoContent';
import Wrapper from '../Wrapper';

export default function LoginComponent() {
  const config = useAppStore((s) => s.currentApp);
  const [loading] = useState(false);
  const theme = useTheme();
  const isMobileDevice = useMediaQuery(theme.breakpoints.down(1024));

  const allowedDomains =
    import.meta.env.VITE_APP_ALLOWED_DOMAINS?.split(',') || [];
  const isEthoraDomain = allowedDomains.includes(window.location.hostname);

  if (!config) {
    return null;
  }

  if (loading) {
    return <FullPageSpinner />;
  }

  // Ethora-branded split layout: blue marketing panel on the left, sign-in
  // form on the right. Only for our own domains; white-label apps and mobile
  // keep the standard layout below.
  if (isEthoraDomain && !isMobileDevice) {
    return (
      <Box
        sx={{
          display: 'flex',
          width: '100vw',
          height: '100vh',
          fontFamily: 'Varela Round',
        }}
      >
        <EthoraBrandPanel />
        <Box
          sx={{
            flex: 1,
            position: 'relative',
            backgroundColor: '#EEF0F3',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
            overflow: 'auto',
          }}
        >
          <SignInForm />
          <Box sx={{ position: 'absolute', bottom: '8px', right: '16px' }}>
            <BuildVersionFooter />
          </Box>
        </Box>
      </Box>
    );
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
