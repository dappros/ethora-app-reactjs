interface Props {
  width?: number;
  height?: number;
  stroke?: string;
}

export function IconUpload({
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
        d="M4.50209 16V17C4.50209 17.7956 4.43935 18.9374 5.00196 19.5C5.56457 20.0626 6.70644 20 7.50209 20H17.5021C18.2977 20 19.4395 20.0626 20.0021 19.5C20.5647 18.9374 20.5021 17.7956 20.5021 17V16M16.5 8L12.5 4M12.5 4L8.5 8M12.5 4V16"
        stroke={stroke}
        className="brand-path-stroke"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
