interface Props {
  width?: number;
  height?: number;
}

export function IconAdmin({ width = 24, height = 24 }: Props) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.5 3.25C2.90326 3.25 2.33097 3.48705 1.90901 3.90901C1.48705 4.33097 1.25 4.90326 1.25 5.5V9V10V13.5C1.25 13.9142 1.58579 14.25 2 14.25C2.41421 14.25 2.75 13.9142 2.75 13.5V10.75H21.25V18.5C21.25 18.6989 21.171 18.8897 21.0303 19.0303C20.8897 19.171 20.6989 19.25 20.5 19.25H6C5.58579 19.25 5.25 19.5858 5.25 20C5.25 20.4142 5.58579 20.75 6 20.75H20.5C21.0967 20.75 21.669 20.5129 22.091 20.091C22.5129 19.669 22.75 19.0967 22.75 18.5V10V9V5.5C22.75 4.90326 22.5129 4.33097 22.091 3.90901C21.669 3.48705 21.0967 3.25 20.5 3.25H3.5ZM14.9614 12.4353C15.2558 12.178 15.6986 12.19 15.9786 12.463L18.2186 14.647C18.5152 14.9362 18.5212 15.411 18.232 15.7076C17.9428 16.0042 17.468 16.0102 17.1714 15.721L15.4272 14.0204L11.9276 17.0797C11.6352 17.3353 11.1959 17.3254 10.9153 17.0567L8.1581 14.4168L2.58901 20.0426C2.2976 20.337 1.82274 20.3394 1.52836 20.048C1.23399 19.7566 1.23158 19.2817 1.52299 18.9874L7.61099 12.8374C7.89897 12.5465 8.36701 12.5402 8.66268 12.8233L11.457 15.4987L14.9614 12.4353ZM5.55499 6.25C5.14078 6.25 4.80499 6.58579 4.80499 7C4.80499 7.41421 5.14078 7.75 5.55499 7.75H6.55499C6.96921 7.75 7.30499 7.41421 7.30499 7C7.30499 6.58579 6.96921 6.25 6.55499 6.25H5.55499ZM9.55599 6.25C9.14178 6.25 8.80599 6.58579 8.80599 7C8.80599 7.41421 9.14178 7.75 9.55599 7.75H18.556C18.9702 7.75 19.306 7.41421 19.306 7C19.306 6.58579 18.9702 6.25 18.556 6.25H9.55599Z"
        fill="#8C8C8C"
      />
    </svg>
  );
}
