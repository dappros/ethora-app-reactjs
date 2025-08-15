import CloseIcon from '@mui/icons-material/Close';
import { Box, IconButton } from '@mui/material';
import { useEffect, useRef } from 'react';

interface FeedbackIframeProps {
  onClick: (value: boolean) => void;
}

export const FeedbackIframe = ({ onClick }: FeedbackIframeProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const listener = (event: MessageEvent) => {
      if (event.data === 'feedback-submitted') {
        onClick(false);
      }
    };
    window.addEventListener('message', listener);
    return () => window.removeEventListener('message', listener);
  }, [onClick]);

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        right: 0,
        width: '100%',
        height: '100%',
        zIndex: 9998,
      }}
    >
      <IconButton
        onClick={() => onClick(false)}
        sx={{ position: 'absolute', top: 16, right: 16, zIndex: 9999 }}
      >
        <CloseIcon />
      </IconButton>
      <iframe
        ref={iframeRef}
        title="Feedback"
        src="https://form.jotform.com/251643190288359"
        width="100%"
        height="100%"
        frameBorder="0"
        scrolling="auto"
        allowFullScreen
      />
    </Box>
  );
};
