import CopyToClipboard from 'react-copy-to-clipboard';
import { toast } from 'react-toastify';
import { IconCopy } from './Icons/IconCopy';

interface Props {
  value: string;
}

export function CopyButton({ value }: Props) {
  return (
    <CopyToClipboard
      onCopy={() => toast.success('Copied')}
      text={value as string}
    >
      <button>
        <IconCopy />
      </button>
    </CopyToClipboard>
  );
}
