import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionId } from '@/lib/session';

export async function POST(request) {
    try {
        const { email } = await request.json();
        const sessionId = await getSessionId();

        if (!email) {
            return NextResponse.json({ error: 'Email required' }, { status: 400 });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // 1. Find or create user
        const user = await prisma.user.upsert({
            where: { email: normalizedEmail },
            update: {}, // Don't change anything if exists
            create: { email: normalizedEmail }
        });

        // 2. We can map sessionId to user if needed, but for now just returning the user info
        // and setting the email cookie might be useful for client persistence if we want,
        // but the user wants "No localStorage premium", so we rely on email entry.

        return NextResponse.json({ success: true, email: normalizedEmail, userId: user.id });
    } catch (err) {
        console.error('Identify error:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
