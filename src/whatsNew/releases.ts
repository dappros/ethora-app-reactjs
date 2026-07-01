// Static What's new release feed. One entry per YY.MM calendar release,
// newest-first - RELEASES[0] is always the current version. The release
// pipeline appends a new entry each month; nothing else needs to change.
//
// Highlights are intentionally short (one sentence) and try to deep-link
// into the app so reading turns into trying. External links land on the
// public blog / SDK READMEs where the full story lives.

export type DeepLink =
  | { kind: 'route'; to: string }
  | { kind: 'modal'; id: 'book-a-call' };

export interface Highlight {
  title: string;
  description: string;
  // Internal route or in-app modal trigger. Mutually exclusive with externalLink.
  deepLink?: DeepLink;
  // Off-app destination (blog post, SDK README, etc.). Opens in a new tab.
  externalLink?: string;
}

export interface Release {
  version: string;
  // Free-form date display, e.g. "June 2026". Not used for sorting; order in
  // RELEASES is the source of truth.
  date: string;
  highlights: Highlight[];
}

export const RELEASE_NOTES_URL =
  'https://github.com/dappros/ethora/blob/main/RELEASE-NOTES.md';

// Bottom-of-page link for the current release's blog post. Updated alongside
// the top RELEASES entry every month.
export const LATEST_BLOG_URL =
  'https://ethora.com/blog/ethora-26-06-release-ai-agents-react-native-sdk/';

export const RELEASES: Release[] = [
  {
    version: '26.06',
    date: 'June 2026',
    highlights: [
      {
        title: 'Your app now has a built-in AI agent',
        description:
          'Every app comes with a Support Agent in its first chat. Customize it or create your own persona.',
        deepLink: { kind: 'route', to: '/app/admin/agents' },
      },
      {
        title: 'Embed an AI chat widget on your site',
        description:
          'One snippet gives visitors a persistent chat with your agent, with every conversation visible in the admin panel.',
        deepLink: { kind: 'route', to: '/app/admin/apps' },
      },
      {
        title: 'Widget Conversations panel',
        description:
          'See every visitor conversation with history, visitor details, and CSV export.',
        deepLink: { kind: 'route', to: '/app/admin/apps' },
      },
      {
        title: 'Voice messages',
        description:
          'Tap to record from the input bar in web and React Native chat.',
      },
      {
        title: 'Dark mode for Android chat',
        description:
          'Full per-mode color control in the Android SDK theme API.',
        externalLink: 'https://github.com/dappros/ethora-sdk-android',
      },
      {
        title: 'Find anything with message search',
        description: 'New API to search your full message archive.',
        externalLink:
          'https://ethora.com/blog/ethora-26-06-release-ai-agents-react-native-sdk/',
      },
    ],
  },
];

export const LATEST_VERSION = RELEASES[0]?.version ?? '';
