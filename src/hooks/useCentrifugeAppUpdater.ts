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

function updateStatsField(
  setAppState: React.Dispatch<React.SetStateAction<ModelApp[]>>,
  appId: string,
  fields: Partial<Record<keyof ModelApp['stats'], number>>
) {
  setAppState((prev) =>
    prev.map((app) =>
      app._id === appId
        ? {
            ...app,
            stats: Object.entries(fields).reduce((acc, [key, value]) => {
              acc[key as keyof typeof acc] += value!;
              return acc;
            }, { ...app.stats }),
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

    const totalKey = `total${capitalize(statName)}` as keyof ModelApp['stats'];
    const recentlyKey = `recently${capitalize(statName)}` as keyof ModelApp['stats'];

    updateStatsField(setAppState, appId, {
      [totalKey]: 1,
      [recentlyKey]: 1,
    });
  }, [data, setAppState]);
}
