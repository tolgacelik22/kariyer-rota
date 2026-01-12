import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionId } from '@/lib/session';
import { KVKK_VERSION, getKvkkHash } from '@/lib/legal/kvkk';

export async function POST(request) {
    try {
        const { answers, utms, kvkkAccepted } = await request.json();

        // 1. Validate KVKK Consent
        if (kvkkAccepted !== true) {
            return NextResponse.json({ error: 'KVKK onayı zorunludur.' }, { status: 400 });
        }

        const sessionId = await getSessionId();
        const ip = request.headers.get('x-forwarded-for') || '0.0.0.0';
        const userAgent = request.headers.get('user-agent');

        // Deterministic score calculation (Rule-based)
        let score = 50;
        if (answers.concern === 'salary') score -= 10;
        if (answers.concern === 'promotion') score -= 15;
        if (answers.concern === 'growth') score -= 5;
        if (answers.risk_tolerance < 5) score -= 10;
        if (answers.seniority === 'senior' && answers.experience === '10+') score += 20;

        // 2. Perform DB operations in a transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create Survey Result
            const sr = await tx.surveyResult.create({
                data: {
                    rawAnswers: answers,
                    score: Math.max(0, Math.min(100, score)),
                },
            });

            // Create Consent Record
            await tx.consent.create({
                data: {
                    sessionId,
                    consentType: 'kvkk',
                    consentVersion: KVKK_VERSION,
                    textHash: getKvkkHash(),
                    accepted: true,
                    ip,
                    userAgent,
                    source: 'quiz',
                    metadata: { submissionId: sr.id }
                }
            });

            return sr;
        });

        // Set session cookie if not exists
        const response = NextResponse.json({ id: result.id });
        if (!request.cookies.get('session_id')) {
            response.cookies.set('session_id', sessionId, {
                httpOnly: true,
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production',
                maxAge: 60 * 60 * 24 * 365 // 1 year
            });
        }

        return response;
    } catch (err) {
        console.error('Survey submission failed:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
