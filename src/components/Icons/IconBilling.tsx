interface Props {
  width?: number;
  height?: number;
}

export function IconBilling({ width = 24, height = 24 }: Props) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* card outline */}
      <rect
        x="2.5"
        y="5.5"
        width="19"
        height="13"
        rx="2"
        stroke="#8C8C8C"
        className="brand-path-stroke-if-active"
        strokeWidth="1.5"
      />
      {/* magnetic strip */}
      <path
        d="M2.5 9.5H21.5"
        stroke="#8C8C8C"
        className="brand-path-stroke-if-active"
        strokeWidth="1.5"
      />
      {/* number block */}
      <path
        d="M6 14H10"
        stroke="#8C8C8C"
        className="brand-path-stroke-if-active"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M14 14H18"
        stroke="#8C8C8C"
        className="brand-path-stroke-if-active"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
