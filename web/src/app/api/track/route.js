import { NextResponse } from 'next/server';
import { trackEvent } from '@/lib/tracking';

export async function POST(request) {
    try {
        const { name, email, userId, submissionId, properties } = await request.json();
        await trackEvent(name, { email, userId, submissionId, properties });
        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
