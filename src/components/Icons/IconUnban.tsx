// Ethora.com platform, copyright: Dappros Ltd (c) 2026, all rights reserved
// Circle with a check mark used for the Unsuspend (lift suspension) action.
interface Props {
  width?: number;
  height?: number;
  color?: string;
  className?: string;
}

export function IconUnban({ width = 16, height = 16, color = 'currentColor', className }: Props) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.8" />
      <path d="M8 12.5l2.7 2.7L16.2 9.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
