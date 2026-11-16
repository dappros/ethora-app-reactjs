import { Box } from '@mui/material';
import React, { ReactNode } from 'react';

interface AuthScreenBodyProps {
  // Logo column above the form instead of beside it.
  stacked: boolean;
  isMobile: boolean;
  children: ReactNode;
}

// The logo column and the form card of the sign-in and sign-up pages. Shared
// with the sign-in screen preview in Settings > Appearance, so the preview
// lays the page out exactly like the live one.
const AuthScreenBody: React.FC<AuthScreenBodyProps> = ({ stacked, isMobile, children }) => (
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
        flexDirection: stacked ? 'column' : 'row',
        gap: isMobile ? '20px' : '16px',
        alignItems: 'center',
      }}
    >
      {children}
    </Box>
  </Box>
);

export default AuthScreenBody;
