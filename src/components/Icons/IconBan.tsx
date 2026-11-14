// Ethora.com platform, copyright: Dappros Ltd (c) 2026, all rights reserved
// "Prohibited" glyph (circle with a backslash) used for the Suspend action.
interface Props {
  width?: number;
  height?: number;
  color?: string;
  className?: string;
}

export function IconBan({ width = 16, height = 16, color = 'currentColor', className }: Props) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.8" />
      <path d="M5.6 5.6L18.4 18.4" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
