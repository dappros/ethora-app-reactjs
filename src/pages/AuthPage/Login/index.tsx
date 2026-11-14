import { Box, useMediaQuery, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { httpLoginHandoff } from '../../../http';
import { useAppStore } from '../../../store/useAppStore';
import { finishLogin } from '../../../utils/finishLogin';
import { showSuspendedLogin } from '../../../utils/suspension';
import { takeHandoffCode } from '../../../utils/loginHandoff';
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
        {/* margin:'auto 0' (not justifyContent:'center') centers the logo +
            form pair vertically while staying safe on short viewports: when
            the content is taller than the available space the auto margins
            resolve to 0, so the top stays reachable instead of being clipped
            above the scroll origin. Same idiom as EthoraSplitLayout. */}
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
          <SignInForm isMobile={isMobileDevice} />
        </Box>
      </Box>
    </Wrapper>
  );
}
