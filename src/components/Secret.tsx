import { useState } from 'react';

interface Props {
  value: string;
  className: string;
}

export function Secret({ value, className }: Props) {
  const [show, setShow] = useState(false);
  return (
    <div className={className}>
      {!show && (
        <a
          className="text-brand-500 underline cursor-pointer"
          onClick={() => setShow(true)}
        >
          Click to reveal
        </a>
      )}
      {show && (
        <div>
          <span className="mr-2">{value}</span>{' '}
          <a
            className="text-brand-500 underline cursor-pointer"
            onClick={() => setShow(false)}
          >
            Hide
          </a>
        </div>
      )}
    </div>
  );
}
