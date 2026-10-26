// Ethora.com platform, copyright: Dappros Ltd (c) 2026, all rights reserved
//
// The Flows tab's Map: every flow as a card (its steps, buttons as rows of
// their own), arrows for each button / goto, and the problems highlighted: a
// flow nothing leads to (amber), a goto to a flow that does not exist (red
// stub), plus the lint warnings below. Plain HTML + SVG, no graph library: the
// geometry is computed in lib/flows/flowMapLayout.ts. Clicking a card or row
// jumps to its line in the editor.

import classNames from 'classnames';
import { useMemo } from 'react';
import type { FlowMapData, FlowMapFlow } from '../../../../http';
import { useTranslation } from '../../../../i18n/useTranslation';
import { CARD_W, EdgeLayout, HEADER_H, layoutFlowMap } from '../../../../lib/flows/flowMapLayout';

const REACH_STYLE: Record<FlowMapFlow['reach'], string> = {
  entry: 'border-brand-500 ring-1 ring-brand-500',
  trigger: 'border-green-500',
  linked: 'border-gray-300 dark:border-gray-400',
  intent: 'border-amber-400 border-dashed',
};

const REACH_KEY: Record<FlowMapFlow['reach'], string> = {
  entry: 'agentPanels.flowsReachEntry',
  trigger: 'agentPanels.flowsReachTrigger',
  linked: 'agentPanels.flowsReachLinked',
  intent: 'agentPanels.flowsReachIntent',
};

const KIND_BADGE: Record<string, string> = {
  say: 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300',
  ask: 'bg-purple-100 text-purple-800 dark:bg-purple-950/50 dark:text-purple-300',
  goto: 'bg-gray-200 text-gray-700',
  end: 'bg-gray-200 text-gray-700',
};

function edgeColor(e: EdgeLayout): string {
  if (e.missing) return '#dc2626';
  return e.via === 'button' ? 'var(--brand-text, var(--bg-brand-primary, #0052CD))' : '#6b7280';
}

export const FlowMapView: React.FC<{
  map: FlowMapData | null;
  // Jump to a YAML line in the editor.
  onJump?: (line?: number) => void;
}> = ({ map, onJump }) => {
  const { t } = useTranslation();
  const layout = useMemo(() => (map ? layoutFlowMap(map) : null), [map]);

  if (!map || !layout || layout.cards.length === 0) {
    return (
      <div data-testid="flows-map-empty" className="rounded border border-dashed p-6 text-sm text-gray-500">
        {t('agentPanels.flowsMapEmpty')}
      </div>
    );
  }

  const lineOf = (flowKey: string, step?: number): number | undefined => {
    const f = map.flows.find((x) => x.key === flowKey);
    if (step === undefined) return f?.line;
    return f?.steps.find((s) => s.index === step)?.line ?? f?.line;
  };

  return (
    <div className="space-y-3" data-testid="flows-map">
      {map.partial && (
        <div data-testid="flows-map-partial" className="rounded border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
          {t('agentPanels.flowsMapPartial')}
        </div>
      )}

      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-600" aria-label={t('agentPanels.flowsMapLegend')}>
        <li className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded border border-brand-500 ring-1 ring-brand-500" />{t('agentPanels.flowsReachEntry')}</li>
        <li className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded border border-green-500" />{t('agentPanels.flowsReachTrigger')}</li>
        <li className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded border border-dashed border-amber-400" />{t('agentPanels.flowsReachIntent')}</li>
        <li className="flex items-center gap-1"><span className="inline-block h-0.5 w-4 bg-red-600" />{t('agentPanels.flowsMapMissing')}</li>
      </ul>

      <div className="overflow-auto rounded border bg-white dark:bg-gray-100" style={{ maxHeight: '65vh' }}>
        <div className="relative" style={{ width: layout.width, height: layout.height }}>
          <svg className="absolute inset-0" width={layout.width} height={layout.height} aria-hidden>
            <defs>
              {['brand', 'gray', 'red'].map((k) => (
                <marker key={k} id={`flows-arrow-${k}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" style={{ fill: k === 'brand' ? 'var(--brand-text, var(--bg-brand-primary, #0052CD))' : k === 'gray' ? '#6b7280' : '#dc2626' }} />
                </marker>
              ))}
            </defs>
            {layout.edges.map((e) => (
              <g key={e.id} data-testid={e.missing ? 'flows-edge-missing' : 'flows-edge'} data-from={e.from} data-to={e.to}>
                <path
                  d={e.path}
                  fill="none"
                  style={{ stroke: edgeColor(e) }}
                  strokeWidth={e.via === 'button' ? 1.6 : 1.3}
                  strokeDasharray={e.back || e.missing ? '5 4' : undefined}
                  opacity={e.back ? 0.7 : 1}
                  markerEnd={e.missing ? undefined : `url(#flows-arrow-${e.via === 'button' ? 'brand' : 'gray'})`}
                />
                {e.missing && (
                  <>
                    <circle cx={e.end.x + 8} cy={e.end.y} r="8" fill="#dc2626" />
                    <text x={e.end.x + 8} y={e.end.y + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff">?</text>
                    <text x={e.end.x + 20} y={e.end.y + 4} fontSize="11" fill="#dc2626" className="dark:fill-red-400">{e.to}</text>
                  </>
                )}
              </g>
            ))}
          </svg>

          {layout.cards.map((c) => (
            <div
              key={c.key}
              data-testid={`flows-card-${c.key}`}
              data-reach={c.flow.reach}
              className={classNames('absolute rounded-lg border-2 bg-white text-xs shadow-sm', REACH_STYLE[c.flow.reach])}
              style={{ left: c.x, top: c.y, width: CARD_W, height: c.h }}
            >
              <button
                type="button"
                title={c.flow.description || t(REACH_KEY[c.flow.reach])}
                onClick={() => onJump?.(c.flow.line)}
                className="block w-full rounded-t-md px-2 text-left hover:bg-gray-50 dark:hover:bg-gray-200"
                style={{ height: c.headerH }}
              >
                <span className="flex items-center gap-1" style={{ height: HEADER_H }}>
                  <span className="truncate font-mono font-semibold">{c.key}</span>
                  <span
                    className={classNames(
                      'ml-auto shrink-0 rounded px-1 text-[10px]',
                      c.flow.reach === 'intent' ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-200' : 'bg-gray-100 text-gray-600'
                    )}
                  >
                    {t(REACH_KEY[c.flow.reach])}
                  </span>
                </span>
                {c.flow.phrases.length > 0 && (
                  <span className="block truncate text-[10px] text-gray-500" title={c.flow.phrases.join(', ')}>
                    {c.flow.phrases.map((p) => `"${p}"`).join(' ')}
                  </span>
                )}
              </button>
              {c.rows.map((r, i) => {
                const missing = r.missing;
                return (
                  <button
                    type="button"
                    key={i}
                    onClick={() => onJump?.(r.line)}
                    className={classNames(
                      'absolute left-0 right-0 flex items-center gap-1 px-2 text-left hover:bg-gray-50 dark:hover:bg-gray-200',
                      r.kind === 'button' && 'pl-5'
                    )}
                    style={{ top: r.y, height: r.h }}
                  >
                    {r.kind === 'button' ? (
                      <span
                        className={classNames(
                          'truncate rounded-full border px-2 py-px',
                          missing ? 'border-red-400 text-red-700 dark:text-red-300' : r.end ? 'border-gray-300 text-gray-600 dark:border-gray-400' : 'border-brand-500 text-brand-500'
                        )}
                      >
                        {r.text}
                      </span>
                    ) : (
                      <>
                        <span className={classNames('shrink-0 rounded px-1 text-[10px] font-semibold uppercase', KIND_BADGE[r.kind])}>{r.kind}</span>
                        <span className={classNames('truncate', missing && 'text-red-700 dark:text-red-300')}>{r.text}</span>
                      </>
                    )}
                    {r.kind === 'button' && r.end && <span className="shrink-0 text-[10px] text-gray-500">{t('agentPanels.flowsMapEnd')}</span>}
                    {r.tag && <span className="ml-auto shrink-0 truncate text-[10px] text-gray-500" style={{ maxWidth: 110 }}>{r.tag}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {map.warnings.length > 0 && (
        <div data-testid="flows-map-warnings" className="rounded border border-amber-300 bg-amber-50 p-2 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
          <div className="mb-1 font-semibold">{t('agentPanels.flowsMapWarnings')}</div>
          <ul className="space-y-1">
            {map.warnings.map((w, i) => {
              const line = w.flow ? lineOf(w.flow, w.step) : undefined;
              return (
                <li key={i}>
                  {line ? (
                    <button type="button" className="mr-1 underline hover:no-underline" onClick={() => onJump?.(line)}>
                      {t('agentPanels.flowsLine').replace('{line}', String(line))}
                    </button>
                  ) : null}
                  {w.message}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};
