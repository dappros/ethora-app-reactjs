import { Box, useMediaQuery, useTheme } from '@mui/material';
import EthoraSplitLayout, { isEthoraDomain } from '../EthoraSplitLayout';
import SignUpForm from '../Forms/RegisterLayout';
import LogoContent from '../LogoContent';
import Wrapper from '../Wrapper';

export default function Register() {
  const theme = useTheme();
  const isMobileDevice = useMediaQuery(theme.breakpoints.down(1024));
  const isSmallDevice = useMediaQuery(theme.breakpoints.down(512));

  // Same rule as the login page: branded split layout on our own domains
  // (desktop only), standard layout everywhere else.
  if (isEthoraDomain() && !isMobileDevice) {
    return (
      <EthoraSplitLayout>
        <SignUpForm isMobile={false} isSmallDevice={false} />
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
          flexDirection: 'column',
        }}
      >
        {/* See the comment in Login/index.tsx: auto margins center the pair
            without making a too-tall registration step unreachable. */}
        <Box
          sx={{
            margin: 'auto 0',
            width: '100%',
            display: 'flex',
            flexDirection: isMobileDevice ? 'column' : 'row',
            gap: isMobileDevice ? '20px' : '16px',
            alignItems: 'center',
          }}
        >
          <LogoContent isMobile={isMobileDevice} />
          <SignUpForm isMobile={isMobileDevice} isSmallDevice={isSmallDevice} />
        </Box>
      </Box>
    </Wrapper>
  );
}
