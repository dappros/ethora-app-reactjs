export const widgetAppearanceDraftKey = (appId: string) => `widget-appearance-draft:${appId}`;

export function hasWidgetAppearanceDraft(appId: string): boolean {
  try { return Boolean(sessionStorage.getItem(widgetAppearanceDraftKey(appId))); }
  catch { return false; }
}
