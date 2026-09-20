import { InputHTMLAttributes, forwardRef } from 'react';

import './CopyInput.scss';
import { CopyButton } from './CopyButton';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  errorText?: string | undefined;
  helperText?: string;
}

export const CopyInput = forwardRef<HTMLInputElement, Props>(
  // errorText / helperText are accepted for API parity but not rendered;
  // they are pulled out so they never reach the <input> as attributes.
  ({ errorText: _errorText, helperText: _helperText, value, ...rest }, ref) => {
    return (
      <div style={{ position: 'relative' }} className="CopyInput">
        <input value={value} disabled {...rest} ref={ref} />
        <CopyButton value={value as string} />
      </div>
    );
  }
);
