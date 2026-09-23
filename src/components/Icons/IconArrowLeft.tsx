interface Props {
  width?: number;
  height?: number;
  stroke?: string;
}

export function IconArrowLeft({
  width = 16,
  height = 10,
  stroke = 'currentColor',
}: Props) {
  return (
    <svg
      className="text-gray-500"
      width={width}
      height={height}
      viewBox="0 0 16 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1 5H15M1 5L5 1M1 5L5 9"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
