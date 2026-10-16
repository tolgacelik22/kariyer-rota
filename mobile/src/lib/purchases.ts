import { Platform } from 'react-native';
import { isRunningInExpoGo } from 'expo';

import { api, Prices, User } from './api';

// Store mode: RevenueCat (App Store / Google Play) — needs a development/production build and API keys.
// Demo mode: web preview, Expo Go or missing keys — "purchases" go to the server's DEMO_MODE endpoint.
const RC_KEY = Platform.select({ ios: process.env.EXPO_PUBLIC_RC_IOS_KEY, android: process.env.EXPO_PUBLIC_RC_ANDROID_KEY });
const IN_EXPO_GO = isRunningInExpoGo();
export const STORE_MODE = !!RC_KEY && Platform.OS !== 'web' && !IN_EXPO_GO;
export const ENTITLEMENT = 'pro';

let Purchases: any = null;
let configured = false;

function rc() {
  if (!STORE_MODE) return null;
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- lazy: native module absent on web / Expo Go
  if (!Purchases) Purchases = require('react-native-purchases').default;
  if (!configured) {
    Purchases.configure({ apiKey: RC_KEY });
    configured = true;
  }
  return Purchases;
}

export type PlanId = 'monthly' | 'yearly';
export type Plan = { id: PlanId; price: string; perMonth: string; trial?: string; savePct?: number; pkg?: any };

const tl = (n: number) => `${Math.round(n).toLocaleString('tr-TR')} TL`;

export async function identifyPurchases(userId: string) {
  try {
    await rc()?.logIn(userId);
  } catch {}
}

export async function resetPurchases() {
  try {
    const p = rc();
    if (p && !(await p.isAnonymous())) await p.logOut();
  } catch {}
}

export async function getPlans(prices: Prices): Promise<Plan[]> {
  const fallback: Plan[] = [
    { id: 'yearly', price: tl(prices.yearly), perMonth: tl(prices.yearly / 12), savePct: Math.round((1 - prices.yearly / (prices.monthly * 12)) * 100) },
    { id: 'monthly', price: tl(prices.monthly), perMonth: tl(prices.monthly) },
  ];
  const p = rc();
  if (!p) return fallback;
  try {
    const offerings = await p.getOfferings();
    const pkgs: any[] = offerings.current?.availablePackages || [];
    const annual = pkgs.find((x) => x.packageType === 'ANNUAL');
    const monthly = pkgs.find((x) => x.packageType === 'MONTHLY');
    if (!annual || !monthly) return fallback;
    const intro = (pkg: any) => (pkg.product.introPrice?.price === 0 ? `${pkg.product.introPrice.periodNumberOfUnits} ${unitTr(pkg.product.introPrice.periodUnit)} ücretsiz` : undefined);
    return [
      {
        id: 'yearly',
        price: annual.product.priceString,
        perMonth: annual.product.pricePerMonthString || tl(annual.product.price / 12),
        savePct: Math.round((1 - annual.product.price / (monthly.product.price * 12)) * 100),
        trial: intro(annual),
        pkg: annual,
      },
      { id: 'monthly', price: monthly.product.priceString, perMonth: monthly.product.priceString, trial: intro(monthly), pkg: monthly },
    ];
  } catch {
    return fallback;
  }
}

function unitTr(u: string) {
  return ({ DAY: 'gün', WEEK: 'hafta', MONTH: 'ay', YEAR: 'yıl' } as Record<string, string>)[u] || u;
}

export async function purchase(plan: Plan): Promise<{ ok: boolean; cancelled?: boolean; user?: User; error?: string }> {
  const p = rc();
  if (!p) {
    try {
      const user = await api<User>('/api/dev/pro', { method: 'POST', body: { plan: plan.id } });
      return { ok: true, user };
    } catch (e: any) {
      return { ok: false, error: e.status === 404 ? 'Ödemeler bu sürümde henüz açık değil.' : e.message };
    }
  }
  try {
    const { customerInfo } = await p.purchasePackage(plan.pkg);
    return { ok: !!customerInfo.entitlements.active[ENTITLEMENT] };
  } catch (e: any) {
    if (e?.userCancelled) return { ok: false, cancelled: true };
    return { ok: false, error: e?.message || 'Satın alma tamamlanamadı.' };
  }
}

export async function restore(): Promise<boolean> {
  const p = rc();
  if (!p) return false;
  try {
    const info = await p.restorePurchases();
    return !!info.entitlements.active[ENTITLEMENT];
  } catch {
    return false;
  }
}

export async function manageSubscriptionUrl(): Promise<string | null> {
  const p = rc();
  if (!p) return null;
  try {
    return (await p.getCustomerInfo()).managementURL;
  } catch {
    return null;
  }
}
