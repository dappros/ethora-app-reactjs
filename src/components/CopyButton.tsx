import CopyToClipboard from 'react-copy-to-clipboard';
import { toast } from 'react-toastify';
import { useTranslation } from '../i18n/useTranslation';
import { IconCopy } from './Icons/IconCopy';

interface Props {
  value: string;
}

export function CopyButton({ value }: Props) {
  const { t } = useTranslation();
  return (
    <CopyToClipboard
      onCopy={() => toast.success(t('copyButton.copiedToast'))}
      text={value as string}
    >
      <button>
        <IconCopy />
      </button>
    </CopyToClipboard>
  );
}
