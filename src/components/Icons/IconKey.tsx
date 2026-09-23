// Ethora.com platform, copyright: Dappros Ltd (c) 2026, all rights reserved
// Key glyph used for "Permissions" actions (ACL editing).
interface Props {
  width?: number;
  height?: number;
  color?: string;
  className?: string;
}

export function IconKey({ width = 16, height = 16, color = 'currentColor', className }: Props) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="8" cy="15" r="4.5" stroke={color} strokeWidth="1.8" />
      <path d="M11.5 11.5L20 3M20 3L22 5M17 6l2 2" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
