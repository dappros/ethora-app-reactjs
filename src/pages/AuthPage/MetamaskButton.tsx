import { lazy, Suspense } from 'react';
import type { MetamaskButtonProps } from './MetamaskButtonImpl';

// The wallet sign-on button pulls in the ethers provider stack (~200 KB of
// web3 code) that only installs with the metamask sign-on option enabled.
// Loaded on demand so the login and register pages do not ship it to every
// visitor; the import starts when the option is enabled and the button
// renders, which is well before anyone can click it.
const MetamaskButtonImpl = lazy(() =>
  import('./MetamaskButtonImpl').then((m) => ({ default: m.MetamaskButton }))
);

export const MetamaskButton = (props: MetamaskButtonProps) => (
  <Suspense fallback={null}>
    <MetamaskButtonImpl {...props} />
  </Suspense>
);
