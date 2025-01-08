import { Box, useMediaQuery, useTheme } from '@mui/material';
import ForgetPasswordForm from '../Forms/ForgetPasswordForm';
import LogoContent from '../LogoContent';
import Wrapper from '../Wrapper';

export default function ForgetPassword() {
  const theme = useTheme();
  const isMobileDevice = useMediaQuery(theme.breakpoints.down(1024));

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
          fontFamily: 'Verdana',
        }}
      >
        <LogoContent isMobile={isMobileDevice} />
        <ForgetPasswordForm isMobile={isMobileDevice} />
      </Box>
    </Wrapper>
  );
}
