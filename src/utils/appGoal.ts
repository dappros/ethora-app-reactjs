import type { ModelApp } from '../models';

export type AppGoal = NonNullable<ModelApp['onboardingGoal']>;

// The goal App Home shows: the one picked on the start screen (or on Home),
// else, for Apps made before it, the one the API worked out from the App's
// data (inferredGoal: website, sdk or messenger; never stored), else the
// website rule below for an API that does not send inferredGoal yet. An App
// with nothing to go on is asked (null): the default Support Agent alone says
// nothing, every new App gets it.
export function appGoal(app?: ModelApp | null): AppGoal | null {
  if (!app) return null;
  if (app.onboardingGoal) return app.onboardingGoal;
  if (app.inferredGoal) return app.inferredGoal;
  const m = app.milestones || {};
  const websiteActivity = Boolean(m.widget_installed?.firstAt || m.widget_test_page?.firstAt || m.widget_visitor?.firstAt);
  const knowledge = Boolean(m.knowledge_added?.firstAt || app.aiBot?.siteUrlsV2?.length || app.aiBot?.files?.length);
  const assistantOn = app.aiBot?.status === 'on';
  if (websiteActivity || (assistantOn && knowledge)) return 'website';
  return null;
}
