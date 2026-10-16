// Pricing hypotheses (not validated): monthly price is A/B tested per user,
// yearly is ~37% cheaper than 12 × monthly.
export const YEARLY_PRICES = { 149: 1090, 199: 1490, 249: 1890 };
export const DEFAULT_VARIANT = '199';
export const FREE_HISTORY_WEEKS = 8;
export const OFFER_AFTER_WEEKS = 6;

export function priceVariants() {
    const raw = process.env.NEXT_PUBLIC_PRICE_VARIANTS || DEFAULT_VARIANT;
    const list = raw.split(',').map((s) => s.trim()).filter((s) => YEARLY_PRICES[s]);
    return list.length ? list : [DEFAULT_VARIANT];
}

export function normalizeVariant(v) {
    return priceVariants().includes(String(v)) ? String(v) : priceVariants()[0];
}

export function pricesFor(variant) {
    const v = normalizeVariant(variant);
    return { variant: v, monthly: Number(v), yearly: YEARLY_PRICES[v] };
}

export function isPro(user) {
    return !!(user?.proUntil && new Date(user.proUntil) > new Date());
}

export function planDays(plan) {
    return plan === 'yearly' ? 366 : 31;
}

// Shopier product links, optionally per price variant: SHOPIER_PRO_MONTHLY_URL_149, ...
export function checkoutUrl(plan, variant) {
    const base = plan === 'yearly' ? 'SHOPIER_PRO_YEARLY_URL' : 'SHOPIER_PRO_MONTHLY_URL';
    return process.env[`${base}_${variant}`] || process.env[base] || null;
}

function idList(name) {
    return (process.env[name] || '').split(',').map((s) => s.trim()).filter(Boolean);
}

// Which Pro plan (if any) a Shopier order buys. Product ids win; customer note "plan:yearly" is a fallback.
export function planForOrder({ productid, customernote }) {
    const pid = String(productid || '');
    if (pid && idList('SHOPIER_PRO_YEARLY_PRODUCT_IDS').includes(pid)) return 'yearly';
    if (pid && idList('SHOPIER_PRO_MONTHLY_PRODUCT_IDS').includes(pid)) return 'monthly';
    const m = String(customernote || '').match(/plan:(monthly|yearly)/);
    return m ? m[1] : null;
}

export async function extendPro(tx, userId, plan) {
    const user = await tx.user.findUnique({ where: { id: userId } });
    const from = isPro(user) ? new Date(user.proUntil) : new Date();
    const proUntil = new Date(from.getTime() + planDays(plan) * 24 * 60 * 60 * 1000);
    return tx.user.update({ where: { id: userId }, data: { proUntil, proPlan: plan } });
}
