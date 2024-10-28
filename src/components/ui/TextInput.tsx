import cn from 'classnames';

import { InputHTMLAttributes, forwardRef } from 'react';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  errorText?: string | undefined;
  helperText?: string;
}

export const TextInput = forwardRef<HTMLInputElement, Props>(
  ({ errorText = '', helperText = '', ...rest }, ref) => {
    return (
      <div
        style={{ position: 'relative' }}
        className={cn({ error: errorText })}
      >
        <input {...rest} ref={ref} />
        {errorText && (
          <span
            className="input-helper"
            style={{
              position: 'absolute',
              right: '7px',
              bottom: '6px',
              fontSize: '12px',
            }}
          >
            {errorText}
          </span>
        )}
      </div>
    );
  }
);
