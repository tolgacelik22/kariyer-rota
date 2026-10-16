import { NextResponse } from 'next/server';
import { getCurrentUser } from './auth';
import { isPro, pricesFor, checkoutUrl } from './plans';

export async function requireUser() {
    const user = await getCurrentUser();
    if (!user) return { error: NextResponse.json({ error: 'Giriş yapmalısın.' }, { status: 401 }) };
    return { user };
}

export function userView(user) {
    const prices = pricesFor(user.priceVariant);
    return {
        id: user.id,
        email: user.email,
        name: user.name,
        jobTitle: user.jobTitle,
        reminderOptIn: user.reminderOptIn,
        pro: isPro(user),
        proUntil: user.proUntil,
        proPlan: user.proPlan,
        prices,
        checkout: {
            monthly: !!checkoutUrl('monthly', prices.variant),
            yearly: !!checkoutUrl('yearly', prices.variant),
        },
    };
}
