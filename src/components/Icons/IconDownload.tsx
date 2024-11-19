interface Props {
  width?: number;
  height?: number;
  stroke?: string;
}

export function IconDownload({
  width = 25,
  height = 24,
  stroke = '#0052CD',
}: Props) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 25 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4.50207 16V17C4.50207 17.7956 4.43934 18.9374 5.00195 19.5C5.56456 20.0626 6.70643 20 7.50207 20H17.5021C18.2977 20 19.4395 20.0626 20.0021 19.5C20.5647 18.9374 20.5021 17.7956 20.5021 17V16M16.5021 12L12.5021 16M12.5021 16L8.50208 12M12.5021 16V4"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
