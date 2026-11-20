import type { BillingPlanId } from '../http';

// Plan in force, as the backend computes it (billing.plans.js effectivePlan):
// a self-serve plan counts while Stripe says active, trialing or past_due;
// Enterprise is set by hand and needs no status.
const PAID_STATUSES = ['active', 'trialing', 'past_due'];
export function effectiveAppPlan(billing?: { plan?: string | null; status?: string | null } | null): BillingPlanId {
  const plan = billing?.plan;
  if (plan === 'enterprise') return 'enterprise';
  if ((plan === 'ai_assistant' || plan === 'small_business') && PAID_STATUSES.includes(String(billing?.status))) return plan;
  return 'free';
}
