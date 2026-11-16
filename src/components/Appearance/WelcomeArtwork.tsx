import { useState } from 'react';
import { isWebImageUrl } from '../../utils/welcomeImage';

/** Decorative artwork, shared by the sign-in page and the editor preview. */
export function WelcomeArtwork({ src, fit = 'cover', className = '' }: { src: string; fit?: 'cover' | 'contain'; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (!isWebImageUrl(src) || failed) return null;
  return <img
    src={src}
    alt=""
    decoding="async"
    onError={() => setFailed(true)}
    className={`block aspect-[16/9] w-full rounded-2xl ${fit === 'contain' ? 'bg-gray-100 object-contain' : 'object-cover'} ${className}`}
  />;
}
