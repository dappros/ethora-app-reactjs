interface Props {
  width?: number;
  height?: number;
  stroke?: string;
}

export function IconLogout({width = 24, height = 24, stroke = "#E53935"}: Props) {
  return (
    <svg width={width} height={height} viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14.5 8V6C14.5 5.46957 14.2893 4.96086 13.9142 4.58579C13.5391 4.21071 13.0304 4 12.5 4H5.5C4.96957 4 4.46086 4.21071 4.08579 4.58579C3.71071 4.96086 3.5 5.46957 3.5 6V18C3.5 18.5304 3.71071 19.0391 4.08579 19.4142C4.46086 19.7893 4.96957 20 5.5 20H12.5C13.0304 20 13.5391 19.7893 13.9142 19.4142C14.2893 19.0391 14.5 18.5304 14.5 18V16" stroke="#E53935" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.5 12H21.5M21.5 12L18.5 9M21.5 12L18.5 15" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
