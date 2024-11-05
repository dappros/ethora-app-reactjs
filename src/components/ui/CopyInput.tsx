import { InputHTMLAttributes, forwardRef } from 'react';

import { CopyButton } from '../CopyButton';
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
        <CopyButton value={value as string} />
      </div>
    );
  }
);
