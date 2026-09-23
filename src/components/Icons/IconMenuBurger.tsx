interface Props {
  width?: number;
  height?: number;
}

export function IconMenuBurger({ width = 24, height = 24 }: Props) {
  return (
    <svg
      className="text-gray-900"
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 6.00098H21M3 12.001H15M3 18.001H21"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
