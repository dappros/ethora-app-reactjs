interface Props {
  width?: number;
  height?: number;
}

export function IconLicense({ width = 24, height = 24 }: Props) {
  return (
    <svg
      className="text-gray-500"
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* key head */}
      <circle
        cx="8"
        cy="12"
        r="4"
        stroke="currentColor"
        className="brand-path-stroke-if-active"
        strokeWidth="1.5"
      />
      {/* key shaft */}
      <path
        d="M12 12H21"
        stroke="currentColor"
        className="brand-path-stroke-if-active"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* key teeth */}
      <path
        d="M18 12V15"
        stroke="currentColor"
        className="brand-path-stroke-if-active"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M21 12V14"
        stroke="currentColor"
        className="brand-path-stroke-if-active"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
