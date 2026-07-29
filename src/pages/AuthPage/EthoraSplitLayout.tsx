import { Box } from '@mui/material';
import React, { ReactNode } from 'react';
import { BuildVersionFooter } from '../../components/BuildVersionFooter';
import EthoraBrandPanel from './EthoraBrandPanel';

// True when the app runs on one of our own (ethora) domains — these get the
// branded split-screen auth pages; white-label apps keep the standard layout.
export function isEthoraDomain(): boolean {
  const allowedDomains =
    import.meta.env.VITE_APP_ALLOWED_DOMAINS?.split(',') || [];
  return allowedDomains.includes(window.location.hostname);
}

// Desktop-only shell for the branded auth pages: blue marketing panel on the
// left, the auth form (children) centered on the right.
const EthoraSplitLayout: React.FC<{ children: ReactNode }> = ({ children }) => (
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
        padding: '40px',
        overflow: 'auto',
      }}
    >
      {/* margin:auto (not align/justify center) keeps a form taller than the
          viewport scrollable instead of clipping its top edge. */}
      <Box
        sx={{
          margin: 'auto',
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        {children}
      </Box>
      <Box sx={{ position: 'absolute', bottom: '8px', right: '16px' }}>
        <BuildVersionFooter />
      </Box>
    </Box>
  </Box>
);

export default EthoraSplitLayout;
