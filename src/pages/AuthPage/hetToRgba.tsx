export function hexToRGBA(hex: string, opacity: number = 0.05): string {
  // @ts-expect-error: match() may return null; callers always pass a valid hex colour
  const [r, g, b] = hex.match(/\w\w/g).map((x) => parseInt(x, 16));
  return `rgba(${r},${g},${b},${opacity})`;
}
