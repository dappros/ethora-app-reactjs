interface Props {
  width?: number;
  height?: number;
}

export function IconAgents({ width = 24, height = 24 }: Props) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* antenna */}
      <path
        d="M12 3V5"
        stroke="#8C8C8C"
        className="brand-path-stroke-if-active"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle
        cx="12"
        cy="2.5"
        r="1"
        stroke="#8C8C8C"
        className="brand-path-stroke-if-active"
        strokeWidth="1.5"
      />
      {/* head */}
      <rect
        x="4"
        y="6"
        width="16"
        height="13"
        rx="3"
        stroke="#8C8C8C"
        className="brand-path-stroke-if-active"
        strokeWidth="1.5"
      />
      {/* eyes */}
      <circle
        cx="9"
        cy="12"
        r="1.2"
        fill="#8C8C8C"
        className="brand-path-fill-if-active"
      />
      <circle
        cx="15"
        cy="12"
        r="1.2"
        fill="#8C8C8C"
        className="brand-path-fill-if-active"
      />
      {/* mouth */}
      <path
        d="M9 16H15"
        stroke="#8C8C8C"
        className="brand-path-stroke-if-active"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* ears */}
      <path
        d="M4 11V14"
        stroke="#8C8C8C"
        className="brand-path-stroke-if-active"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M20 11V14"
        stroke="#8C8C8C"
        className="brand-path-stroke-if-active"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
