interface Props {
  width?: number;
  height?: number;
}

// Shield with a check: Trust & Safety evidence review.
export function IconEvidence({ width = 24, height = 24 }: Props) {
  return (
    <svg
      className="text-gray-500"
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 2.75L4.75 5.5V11.2C4.75 15.75 7.85 19.6 12 21.25C16.15 19.6 19.25 15.75 19.25 11.2V5.5L12 2.75Z"
        stroke="currentColor"
        className="brand-path-stroke-if-active"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M8.75 12L11 14.25L15.25 10"
        stroke="currentColor"
        className="brand-path-stroke-if-active"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
