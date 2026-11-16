import { Box } from '@mui/material';
import React, { ReactNode } from 'react';

interface SignInCardProps {
  isMobile?: boolean;
  // Hug the content instead of the fixed desktop height (the centered
  // welcome layout, where the card sits under the welcome column).
  hug?: boolean;
  children: ReactNode;
}

// The sign-in card. Shared by the login page and the sign-in screen preview in
// Settings > Appearance.
const SignInCard: React.FC<SignInCardProps> = ({ isMobile = false, hug = false, children }) => {
  const fitContent = isMobile || hug;
  return (
    <Box
      sx={{
        padding: '16px',
        borderRadius: '24px',
        backgroundColor: 'rgb(var(--c-surface))',
        boxShadow: isMobile ? 'none' : '0px 4px 35px 0px #00000014',
        p: isMobile ? '0px 16px' : '24px 40px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        minWidth: 0,
        width: '100%',
        maxWidth: isMobile ? '486px' : '600px',
        // On mobile the card must hug its content: stretching it to the full
        // column height is what pushed the "Don't have an account?" line to
        // the bottom of the screen (space-between over ~200px of dead space)
        // and left the fields pinned to the top. Desktop keeps the fixed
        // 588px card so the split/branded layouts are unchanged.
        maxHeight: fitContent ? 'none' : '588px',
        minHeight: fitContent ? 'auto' : '588px',
        height: fitContent ? 'auto' : '100%',
        justifyContent: 'space-between',
      }}
    >
      {children}
    </Box>
  );
};

export default SignInCard;
