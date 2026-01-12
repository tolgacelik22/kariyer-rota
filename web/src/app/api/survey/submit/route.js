import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionId } from '@/lib/session';
import { KVKK_VERSION, getKvkkHash } from '@/lib/legal/kvkk';

export async function POST(request) {
    console.log('Survey Submit: Payload received');
    try {
        const body = await request.json();
        const { answers = {}, utms = {}, kvkkAccepted } = body;

        // 1. Validate KVKK Consent (Strict)
        if (kvkkAccepted !== true) {
            console.warn('Survey Submit: KVKK not accepted');
            return NextResponse.json({ error: 'KVKK onayı olmadan analiz başlatılamaz.' }, { status: 400 });
        }

        const sessionId = await getSessionId();
        const ip = request.headers.get('x-forwarded-for') || '0.0.0.0';
        const userAgent = request.headers.get('user-agent') || 'unknown';

        // Deterministic score calculation with safety
        let score = 50;
        if (answers.concern === 'salary') score -= 10;
        else if (answers.concern === 'promotion') score -= 15;
        else if (answers.concern === 'growth') score -= 5;

        if (Number(answers.risk_tolerance) < 5) score -= 10;
        if (answers.seniority === 'senior' && answers.experience === '10+') score += 20;

        console.log('Survey Submit: DB Transaction starting', { score });

        const result = await prisma.$transaction(async (tx) => {
            // Create Survey Result
            const sr = await tx.surveyResult.create({
                data: {
                    rawAnswers: answers,
                    score: Math.max(0, Math.min(100, score)),
                },
            });

            // Create Consent Record
            try {
                await tx.consent.create({
                    data: {
                        sessionId: sessionId || 'no-session',
                        consentType: 'kvkk',
                        consentVersion: KVKK_VERSION,
                        textHash: getKvkkHash(),
                        accepted: true,
                        ip: ip.split(',')[0].trim(), // Get first IP if multiple
                        userAgent,
                        source: 'quiz',
                        metadata: {
                            submissionId: sr.id,
                            utm_source: utms.utm_source || null
                        }
                    }
                });
            } catch (consentErr) {
                console.error('Survey Submit: Consent record failed (DB schema issue?)', consentErr);
                // We keep the survey result even if consent logging fails to avoid blocking user,
                // but usually, we want this to work.
            }

            return sr;
        });

        console.log('Survey Submit: Success', result.id);

        const response = NextResponse.json({ id: result.id });

        // Ensure session cookie
        const existingSession = request.cookies.get('session_id');
        if (!existingSession) {
            response.cookies.set('session_id', sessionId, {
                httpOnly: true,
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production',
                maxAge: 60 * 60 * 24 * 365
            });
        }

        return response;
    } catch (err) {
        console.error('Survey Submit: Fatal error', err);
        return NextResponse.json({
            error: 'Sistem hatası. Lütfen tekrar deneyin.',
            details: err.message
        }, { status: 500 });
    }
}
