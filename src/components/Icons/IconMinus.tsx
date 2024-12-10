interface Props {
  width?: number;
  height?: number;
  className?: string;
}

export function IconMinus({ width = 10, height = 2 }: Props) {
  return (
    <svg width={width} height={height} viewBox="0 0 10 2" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 1H9" stroke="white" stroke-width="1.5" stroke-linecap="round" />
    </svg>
  );
}
