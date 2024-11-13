interface Props {
  width?: number;
  height?: number;
  stroke?: string;
}

export function IconArrowRight({ width = 24, height = 24, stroke = "#0052CD" }: Props) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M19 12H5M19 12L15 8M19 12L15 16"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
