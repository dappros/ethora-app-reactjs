// Unsaved widget appearance kept in this browser tab, so a reload does not
// lose it. One entry per App; restored only while the App's saved appearance
// is still the one the draft started from.
type Draft = { base: Record<string, string>; values: Record<string, string> };

export const widgetAppearanceDraftKey = (appId: string) => `widget-appearance-draft:${appId}`;

export function readWidgetAppearanceDraft(appId: string, savedRecord: Record<string, string>): Record<string, string> | null {
  try {
    const stored = JSON.parse(sessionStorage.getItem(widgetAppearanceDraftKey(appId)) || 'null') as Draft | null;
    if (!stored?.base || !stored.values) return null;
    if (JSON.stringify(sortKeys(stored.base)) !== JSON.stringify(sortKeys(savedRecord))) {
      // Saved meanwhile (elsewhere): the draft is stale.
      sessionStorage.removeItem(widgetAppearanceDraftKey(appId));
      return null;
    }
    return stored.values;
  } catch {
    return null;
  }
}

export function writeWidgetAppearanceDraft(appId: string, base: Record<string, string>, values: Record<string, string> | null) {
  try {
    if (values) sessionStorage.setItem(widgetAppearanceDraftKey(appId), JSON.stringify({ base, values }));
    else sessionStorage.removeItem(widgetAppearanceDraftKey(appId));
  } catch {
    /* Private browsing can disable storage; drafts are a convenience. */
  }
}

function sortKeys(record: Record<string, string>) {
  return Object.fromEntries(Object.entries(record).sort(([a], [b]) => a.localeCompare(b)));
}
