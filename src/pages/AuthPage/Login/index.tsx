import { Box, useMediaQuery, useTheme } from '@mui/material';
import { useState } from 'react';
import { useAppStore } from '../../../store/useAppStore';
import EthoraSplitLayout, { isEthoraDomain } from '../EthoraSplitLayout';
import SignInForm from '../Forms/LoginForm';
import { FullPageSpinner } from '../FullPageSpinner';
import LogoContent from '../LogoContent';
import Wrapper from '../Wrapper';

export default function LoginComponent() {
  const config = useAppStore((s) => s.currentApp);
  const [loading] = useState(false);
  const theme = useTheme();
  const isMobileDevice = useMediaQuery(theme.breakpoints.down(1024));

  if (!config) {
    return null;
  }

  if (loading) {
    return <FullPageSpinner />;
  }

  // Ethora-branded split layout: blue marketing panel on the left, sign-in
  // form on the right. Only for our own domains; white-label apps and mobile
  // keep the standard layout below.
  if (isEthoraDomain() && !isMobileDevice) {
    return (
      <EthoraSplitLayout>
        <SignInForm />
      </EthoraSplitLayout>
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
