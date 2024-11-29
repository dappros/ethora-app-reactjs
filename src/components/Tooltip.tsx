import { ReactElement, useState } from "react";

interface Props {
  children: ReactElement;
  title: string;
  className: string;
}

export function Tooltip({ children, title, className }: Props) {
  const [show, setShow] = useState(false)

  return (
    <div
      onMouseEnter={() => { setShow(true) }}
      onMouseLeave={() => { setShow(false) }}
      className={className}
    >
      {children}
      {show && (
        <div className="absolute top-[-40px] whitespace-nowrap p-2 font-sans text-[12px] -translate-x-1/2 text-black bg-white rounded-lg shadow">
          {title}
        </div>
      )}
    </div>
  )
}
