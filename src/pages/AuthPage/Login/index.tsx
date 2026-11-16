import { useMediaQuery, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { httpLoginHandoff } from '../../../http';
import { useAppStore } from '../../../store/useAppStore';
import { finishLogin } from '../../../utils/finishLogin';
import { showSuspendedLogin } from '../../../utils/suspension';
import { takeHandoffCode } from '../../../utils/loginHandoff';
import AuthScreenBody from '../AuthScreenBody';
import { isStackedAuthLayout } from '../authLayout';
import EthoraSplitLayout, { isEthoraDomain } from '../EthoraSplitLayout';
import SignInForm from '../Forms/LoginForm';
import { FullPageSpinner } from '../FullPageSpinner';
import LogoContent from '../LogoContent';
import Wrapper from '../Wrapper';

export default function LoginComponent() {
  const config = useAppStore((s) => s.currentApp);
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const isMobileDevice = useMediaQuery(theme.breakpoints.down(1024));
  const navigate = useNavigate();

  useEffect(() => {
    if (!config) return;
    const code = takeHandoffCode();
    if (!code) return;
    setLoading(true);
    httpLoginHandoff(code)
      .then(({ data }) => finishLogin(data, navigate, config))
      .catch((error: unknown) => {
        setLoading(false);
        if (showSuspendedLogin(error, navigate)) return;
        console.warn('[login] handoff failed, showing the sign-in form', error);
      });
  }, [config, navigate]);

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

  const stacked = isStackedAuthLayout(config, isMobileDevice);

  return (
    <Wrapper>
      <AuthScreenBody stacked={stacked} isMobile={isMobileDevice}>
        <LogoContent isMobile={isMobileDevice} centered={stacked} welcome />
        <SignInForm isMobile={isMobileDevice} hug={stacked} />
      </AuthScreenBody>
    </Wrapper>
  );
}
