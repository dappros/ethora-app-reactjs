// Agent categories: the fixed list the backend accepts
// (services/api/src/modules/agents/agentCategories.js). Owners tag their own
// agents; the Agents page filters on them.
export const AGENT_CATEGORIES = ['customer-support', 'persona', 'entertainment', 'worker'] as const;

export type AgentCategory = (typeof AGENT_CATEGORIES)[number];

export const AGENT_CATEGORY_LABEL_KEYS: Record<AgentCategory, string> = {
  'customer-support': 'agentCategories.customerSupport',
  persona: 'agentCategories.persona',
  entertainment: 'agentCategories.entertainment',
  worker: 'agentCategories.worker',
};

export function isAgentCategory(v: string): v is AgentCategory {
  return (AGENT_CATEGORIES as readonly string[]).includes(v);
}
