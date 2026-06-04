interface Props {
  width?: number;
  height?: number;
}

export function IconAccount({ width = 24, height = 24 }: Props) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="12"
        cy="8"
        r="4"
        stroke="#8C8C8C"
        className="brand-path-stroke-if-active"
        strokeWidth="1.5"
      />
      <path
        d="M4 20.25C4 16.5221 7.58172 13.5 12 13.5C16.4183 13.5 20 16.5221 20 20.25"
        stroke="#8C8C8C"
        className="brand-path-stroke-if-active"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
