import { useEffect } from 'react';
import { useCentrifugeChannel } from './useCentrifuge';
import { ModelApp } from '../models';

type CounterType =
  | 'counter_chats'
  | 'counter_api_calls'
  | 'counter_aitokens'
  | 'counter_files'
  | 'counter_transactions'
  | 'counter_sessions'
  | 'counter_registered';

interface CentrifugeData {
  type: CounterType;
  appId: string;
}

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

type CounterStatKey = Exclude<keyof ModelApp['stats'], 'lastActivityAt'>;

function updateStatsField(
  setAppState: React.Dispatch<React.SetStateAction<ModelApp[]>>,
  appId: string,
  fields: Partial<Record<CounterStatKey, number>>
) {
  setAppState((prev) =>
    prev.map((app) =>
      app._id === appId
        ? {
            ...app,
            stats: {
              ...Object.entries(fields).reduce((acc, [key, value]) => {
                acc[key as CounterStatKey] += value!;
                return acc;
              }, { ...app.stats }),
              // A live counter just ticked, so the app was active today.
              lastActivityAt: new Date().toISOString(),
            },
          }
        : app
    )
  );
}

export function useCentrifugeAppUpdater(
  setAppState: React.Dispatch<React.SetStateAction<ModelApp[]>>
) {
  const { data } = useCentrifugeChannel();

  useEffect(() => {
    if (!data) return;

    const { type, appId } = data as CentrifugeData;

    if (!type.startsWith('counter_')) return;

    const statBase = type.replace('counter_', '');
    const statName = statBase
      .split('_')
      .map((part, i) => (i === 0 ? part : capitalize(part)))
      .join('');

    const totalKey = `total${capitalize(statName)}` as CounterStatKey;
    const recentlyKey = `recently${capitalize(statName)}` as CounterStatKey;

    updateStatsField(setAppState, appId, {
      [totalKey]: 1,
      [recentlyKey]: 1,
    });
  }, [data, setAppState]);
}
