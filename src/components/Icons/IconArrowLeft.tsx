interface Props {
  width?: number;
  height?: number;
}

export function IconArrowLeft({ width = 16, height = 10 }: Props) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 16 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1 5H15M1 5L5 1M1 5L5 9"
        stroke="#8C8C8C"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
