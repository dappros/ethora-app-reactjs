import { InputHTMLAttributes, forwardRef } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { IconCopy } from '../Icons/IconCopy';

import { toast } from 'react-toastify';
import './CopyInput.scss';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  errorText?: string | undefined;
  helperText?: string;
}

export const CopyInput = forwardRef<HTMLInputElement, Props>(
  ({ errorText = '', helperText = '', value, ...rest }, ref) => {
    return (
      <div style={{ position: 'relative' }} className="CopyInput">
        <input value={value} disabled {...rest} ref={ref} />
        <CopyToClipboard
          onCopy={() => toast.success('Copied')}
          text={value as string}
        >
          <button>
            <IconCopy />
          </button>
        </CopyToClipboard>
      </div>
    );
  }
);
