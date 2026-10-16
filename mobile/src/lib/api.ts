import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Device from 'expo-device';

// API base: explicit env wins; in development it points at the Next.js server on this machine.
function resolveBaseUrl() {
  const explicit = process.env.EXPO_PUBLIC_API_URL;
  if (explicit) return explicit.replace(/\/$/, '');
  if (!__DEV__) return 'https://kariyer.magicdigital.org';
  if (Platform.OS === 'web') return `http://${globalThis.location?.hostname || 'localhost'}:3000`;
  if (Platform.OS === 'android' && !Device.isDevice) return 'http://10.0.2.2:3000';
  const host = Constants.expoConfig?.hostUri?.split(':')[0];
  return `http://${host || 'localhost'}:3000`;
}

export const API_URL = resolveBaseUrl();

let authToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function setUnauthorizedHandler(fn: () => void) {
  onUnauthorized = fn;
}

export class ApiError extends Error {
  status: number;
  paywall?: boolean;
  constructor(message: string, status: number, paywall?: boolean) {
    super(message);
    this.status = status;
    this.paywall = paywall;
  }
}

export async function api<T = any>(path: string, opts: { method?: string; body?: unknown; raw?: boolean } = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: opts.method || 'GET',
      headers: {
        ...(opts.body ? { 'Content-Type': 'application/json' } : {}),
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });
  } catch {
    throw new ApiError('Sunucuya ulaşılamadı. İnternet bağlantını kontrol et.', 0);
  }
  if (opts.raw && res.ok) return (await res.text()) as T;
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && authToken) onUnauthorized?.();
  if (!res.ok) throw new ApiError(data.error || 'Bir şeyler ters gitti.', res.status, data.paywall);
  return data as T;
}

export type Prices = { variant: string; monthly: number; yearly: number };
export type User = {
  id: string;
  email: string;
  name: string | null;
  jobTitle: string | null;
  reminderOptIn: boolean;
  pro: boolean;
  proUntil: string | null;
  proPlan: 'monthly' | 'yearly' | null;
  prices: Prices;
};

export type Entry = {
  id: string;
  weekStart: string;
  locked: boolean;
  wins?: string;
  impact?: string | null;
  challenges?: string | null;
  learnings?: string | null;
  nextWeek?: string | null;
  tags?: string[];
  links?: string[];
  mood?: number | null;
  aiSummary?: string | null;
};

export type EntriesResponse = {
  currentWeek: string;
  backfillWeeks: number;
  historyLimitWeeks: number | null;
  stats: { total: number; streak: number; loggedThisWeek: boolean; showOffer: boolean };
  entries: Entry[];
};

export type ReportType = 'monthly' | 'quarterly' | 'review' | 'stories';
export type ReportMeta = { id: string; type: ReportType; periodStart: string; periodEnd: string; source: 'ai' | 'template'; entryCount: number; createdAt: string };
export type Report = ReportMeta & { content: string };
