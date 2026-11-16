import { useMediaQuery, useTheme } from '@mui/material';
import { useAppStore } from '../../../store/useAppStore';
import AuthScreenBody from '../AuthScreenBody';
import { isStackedAuthLayout } from '../authLayout';
import EthoraSplitLayout, { isEthoraDomain } from '../EthoraSplitLayout';
import SignUpForm from '../Forms/RegisterLayout';
import LogoContent from '../LogoContent';
import Wrapper from '../Wrapper';

export default function Register() {
  const theme = useTheme();
  const isMobileDevice = useMediaQuery(theme.breakpoints.down(1024));
  const isSmallDevice = useMediaQuery(theme.breakpoints.down(512));
  const config = useAppStore((s) => s.currentApp);

  // Same rule as the login page: branded split layout on our own domains
  // (desktop only), standard layout everywhere else.
  if (isEthoraDomain() && !isMobileDevice) {
    return (
      <EthoraSplitLayout>
        <SignUpForm isMobile={false} isSmallDevice={false} />
      </EthoraSplitLayout>
    );
  }

  const stacked = isStackedAuthLayout(config, isMobileDevice);

  return (
    <Wrapper>
      <AuthScreenBody stacked={stacked} isMobile={isMobileDevice}>
        <LogoContent isMobile={isMobileDevice} centered={stacked} welcome />
        <SignUpForm isMobile={isMobileDevice} isSmallDevice={isSmallDevice} />
      </AuthScreenBody>
    </Wrapper>
  );
}
