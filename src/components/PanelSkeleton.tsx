export function PanelSkeleton({ label }: { label: string }) {
  return <div role="status" aria-label={label} className="animate-pulse space-y-4 rounded-xl border border-gray-200 bg-white p-5">
    <span className="sr-only">{label}</span>
    <div className="h-5 w-1/3 rounded bg-gray-200" />
    <div className="h-3 w-3/4 rounded bg-gray-200" />
    <div className="h-24 rounded-lg bg-gray-100" />
    <div className="h-24 rounded-lg bg-gray-100" />
  </div>;
}
