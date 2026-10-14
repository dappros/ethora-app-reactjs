// What AI tokens are spent on (the AI usage ledger's `kind`), in display order.
export const AI_USAGE_KINDS = ['reply', 'gate', 'heartbeat', 'flow', 'agent_reply', 'embed_site', 'embed_docs', 'embed_query'] as const;

export function aiUsageKindLabel(t: (key: string) => string, kind: string) {
  return (AI_USAGE_KINDS as readonly string[]).includes(kind) ? t(`aiUsage.kind.${kind}`) : t('aiUsage.kind.other');
}
