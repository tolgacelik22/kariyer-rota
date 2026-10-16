import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';

import { api, EntriesResponse } from './api';

// Reloads whenever the screen regains focus (e.g. after saving an entry in the modal).
export function useFocusData<T>(path: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setData(await api<T>(path));
      setError(null);
    } catch (e: any) {
      setError(e.message);
    }
  }, [path]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  return { data, error, refresh, refreshing, reload: load };
}

export const useEntries = () => useFocusData<EntriesResponse>('/api/entries');
