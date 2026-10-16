import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { api, setAuthToken, setUnauthorizedHandler, User } from './api';
import { prefs, secure } from './storage';
import { identifyPurchases, resetPurchases } from './purchases';
import { cancelReminders } from './notifications';

const TOKEN_KEY = 'promotly.token';

type AuthState = {
  ready: boolean;
  user: User | null;
  onboarded: boolean;
  setOnboarded: () => Promise<void>;
  signIn: (token: string, user: User) => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<User | null>;
  setUser: (u: User) => void;
};

const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [onboarded, setOnboardedState] = useState(false);

  const signOut = useCallback(async () => {
    setAuthToken(null);
    await secure.remove(TOKEN_KEY);
    await resetPurchases();
    await cancelReminders();
    setUser(null);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const me = await api<User>('/api/me');
      setUser(me);
      return me;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      signOut();
    });
    (async () => {
      setOnboardedState(await prefs.get('onboarded', false));
      const token = await secure.get(TOKEN_KEY);
      if (token) {
        setAuthToken(token);
        const me = await refresh();
        if (me) identifyPurchases(me.id);
      }
      setReady(true);
    })();
  }, [refresh, signOut]);

  const value = useMemo<AuthState>(
    () => ({
      ready,
      user,
      onboarded,
      setOnboarded: async () => {
        await prefs.set('onboarded', true);
        setOnboardedState(true);
      },
      signIn: async (token, u) => {
        setAuthToken(token);
        await secure.set(TOKEN_KEY, token);
        setUser(u);
        identifyPurchases(u.id);
      },
      signOut,
      refresh,
      setUser,
    }),
    [ready, user, onboarded, signOut, refresh],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth outside AuthProvider');
  return ctx;
}
