interface Props {
  width?: number;
  height?: number;
}

export function IconCoin({ width = 24, height = 24 }: Props) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="12"
        cy="12"
        r="8.7"
        fill="url(#paint0_linear_3005_41361)"
        stroke="#DB8828"
        strokeWidth="0.6"
      />
      <path
        d="M15.0681 7.37922V7.22922H14.9181H13.2438V6.40625V6.25625H13.0938H11.391H11.241V6.40625V7.22922H8.59375H8.23162L8.48768 7.48529L12.8816 11.8792L8.48768 16.2732L8.23162 16.5292H8.59375H11.241V17.5954V17.7454H11.391H13.0938H13.2438V17.5954V16.5292H14.9181H15.0681V16.3792V14.9198V14.7698H14.9181H12.5943L15.2695 11.9831L15.3693 11.8792L15.2695 11.7753L12.5943 8.98868H14.9181H15.0681V8.83868V7.37922Z"
        fill="white"
        stroke="#DB8828"
        strokeWidth="0.3"
      />
      <defs>
        <linearGradient
          id="paint0_linear_3005_41361"
          x1="19"
          y1="6.5"
          x2="4.5"
          y2="17.5"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#FFD100" />
          <stop offset="0.505208" stop-color="#FB8E3A" />
          <stop offset="1" stop-color="#FFD100" />
        </linearGradient>
      </defs>
    </svg>
  );
}
