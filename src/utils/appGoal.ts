import { ModelApp } from '../models';

export type AppGoal = NonNullable<ModelApp['onboardingGoal']>;

// The goal App Home shows: the one picked on the start screen, or, for Apps
// made before it, the obvious one. An App whose assistant is on and that has
// website knowledge, or whose widget has been seen on a page or by visitors,
// is a website App. Every other App without a goal is asked (null): the
// default Support Agent alone says nothing, every new App gets it.
export function appGoal(app?: ModelApp | null): AppGoal | null {
  if (!app) return null;
  if (app.onboardingGoal) return app.onboardingGoal;
  const m = app.milestones || {};
  const websiteActivity = Boolean(m.widget_installed?.firstAt || m.widget_test_page?.firstAt || m.widget_visitor?.firstAt);
  const knowledge = Boolean(m.knowledge_added?.firstAt || app.aiBot?.siteUrlsV2?.length || app.aiBot?.files?.length);
  const assistantOn = app.aiBot?.status === 'on';
  if (websiteActivity || (assistantOn && knowledge)) return 'website';
  return null;
}
