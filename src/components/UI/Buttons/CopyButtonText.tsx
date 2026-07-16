import CheckIcon from '@mui/icons-material/Check';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import React, { useEffect, useState } from 'react';
import { useTranslation } from '../../../i18n/useTranslation';

interface CopyButtonTextProps {
  textToCopy: string;
}

const CopyButtonText: React.FC<CopyButtonTextProps> = ({ textToCopy }) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const checkClipboard = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      setCopied(clipboardText === textToCopy);
    } catch (err) {
      console.error('Unable to read clipboard:', err);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  useEffect(() => {
    const handleFocus = () => {
      checkClipboard();
    };
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  return (
    <Tooltip title={copied ? t('copyButtonText.copied') : t('copyButtonText.copy')}>
      <IconButton
        onClick={handleCopy}
        aria-label={t('copyButtonText.ariaLabel')}
        className="hover:bg-brand-hover"
      >
        {copied ? (
          <CheckIcon sx={{ color: '#128dca', width: 20 }} />
        ) : (
          <ContentCopyIcon sx={{ color: '#128dca', width: 20 }} />
        )}
      </IconButton>
    </Tooltip>
  );
};

export default CopyButtonText;
