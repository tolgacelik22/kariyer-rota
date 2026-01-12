import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request) {
    try {
        const { answers, utms } = await request.json();

        // Deterministic score calculation (Rule-based)
        let score = 50;

        if (answers.concern === 'salary') score -= 10;
        if (answers.concern === 'promotion') score -= 15;
        if (answers.concern === 'growth') score -= 5;
        if (answers.risk_tolerance < 5) score -= 10;
        if (answers.seniority === 'senior' && answers.experience === '10+') score += 20;

        const result = await prisma.surveyResult.create({
            data: {
                rawAnswers: answers,
                score: Math.max(0, Math.min(100, score)),
            },
        });

        // If we had a user here we'd link it, but in Model A we link at email step
        // However, if we know some context from utms, we can store it in result if needed
        // or just rely on the later User creation.

        return NextResponse.json({ id: result.id });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
