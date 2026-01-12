import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionId } from '@/lib/session';
import { KVKK_VERSION, getKvkkHash } from '@/lib/legal/kvkk';

export async function POST(request) {
    try {
        const body = await request.json();
        const { answers, utms, kvkkAccepted, consentVersion, consentTextHash } = body;

        // 1. Validate KVKK Consent (Strict)
        if (kvkkAccepted !== true) {
            return NextResponse.json({ error: 'KVKK onayı olmadan analiz başlatılamaz.' }, { status: 400 });
        }

        const sessionId = await getSessionId();
        const ip = request.headers.get('x-forwarded-for') || '0.0.0.0';
        const userAgent = request.headers.get('user-agent');

        // Deterministic score calculation
        let score = 50;
        if (answers.concern === 'salary') score -= 10;
        if (answers.concern === 'promotion') score -= 15;
        if (answers.concern === 'growth') score -= 5;
        if (answers.risk_tolerance < 5) score -= 10;
        if (answers.seniority === 'senior' && answers.experience === '10+') score += 20;

        const result = await prisma.$transaction(async (tx) => {
            // Create Survey Result
            const sr = await tx.surveyResult.create({
                data: {
                    rawAnswers: answers,
                    score: Math.max(0, Math.min(100, score)),
                },
            });

            // Create Consent Record with strict versioning
            await tx.consent.create({
                data: {
                    sessionId,
                    consentType: 'kvkk',
                    consentVersion: consentVersion || KVKK_VERSION,
                    textHash: consentTextHash || getKvkkHash(),
                    accepted: true,
                    ip,
                    userAgent,
                    source: 'quiz',
                    metadata: { submissionId: sr.id, answers: Object.keys(answers) }
                }
            });

            return sr;
        });

        const response = NextResponse.json({ id: result.id });

        // Ensure session cookie
        if (!request.cookies.get('session_id')) {
            response.cookies.set('session_id', sessionId, {
                httpOnly: true,
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production',
                maxAge: 60 * 60 * 24 * 365
            });
        }

        return response;
    } catch (err) {
        console.error('Survey submission failed:', err);
        return NextResponse.json({ error: 'Sistem hatası. Lütfen tekrar deneyin.' }, { status: 500 });
    }
}
