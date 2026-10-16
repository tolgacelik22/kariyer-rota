import { NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { trackEvent } from '@/lib/tracking';
import { sendMail, mailConfigured, mailLayout } from '@/lib/mail';
import { normalizeVariant } from '@/lib/plans';
import { KVKK_VERSION, getKvkkHash } from '@/lib/legal/kvkk';

function safeNext(next) {
    return typeof next === 'string' && next.startsWith('/') && !next.startsWith('//') ? next : '/app';
}

export async function POST(request) {
    try {
        const { email, surveyId, utms, next, kvkkAccepted } = await request.json();

        const normalizedEmail = String(email || '').toLowerCase().trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
            return NextResponse.json({ error: 'Geçerli bir e-posta adresi girin.' }, { status: 400 });
        }

        const recentTokens = await prisma.token.count({
            where: {
                user: { email: normalizedEmail },
                createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
            },
        });
        if (recentTokens >= 5) {
            return NextResponse.json({ error: 'Çok fazla deneme. Lütfen bir saat sonra tekrar deneyin.' }, { status: 429 });
        }

        let user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
        if (!user) {
            user = await prisma.user.create({
                data: {
                    email: normalizedEmail,
                    utmSource: utms?.utm_source,
                    utmMedium: utms?.utm_medium,
                    utmCampaign: utms?.utm_campaign,
                    priceVariant: normalizeVariant(request.cookies.get('pv')?.value),
                },
            });
            await trackEvent('signup', { email: normalizedEmail, userId: user.id, properties: utms || {} });
        }

        if (kvkkAccepted === true) {
            await prisma.consent.create({
                data: {
                    userId: user.id,
                    sessionId: request.cookies.get('session_id')?.value || 'login',
                    consentType: 'kvkk',
                    consentVersion: KVKK_VERSION,
                    textHash: getKvkkHash(),
                    accepted: true,
                    ip: (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() || null,
                    userAgent: request.headers.get('user-agent'),
                    source: 'login',
                },
            });
        }

        if (surveyId) {
            await prisma.surveyResult.updateMany({
                where: { id: surveyId, userId: null },
                data: { userId: user.id },
            });
        }

        const rawToken = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
        await prisma.token.create({
            data: {
                hash: tokenHash,
                userId: user.id,
                type: 'magic_link',
                expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
            },
        });

        const magicLink = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/verify?token=${rawToken}&next=${encodeURIComponent(safeNext(next))}`;

        // Local demo without SMTP: hand the link back instead of emailing it.
        if (!mailConfigured() && (process.env.NODE_ENV !== 'production' || process.env.DEMO_MODE === '1')) {
            return NextResponse.json({ success: true, devLink: magicLink });
        }

        try {
            await sendMail({
                to: normalizedEmail,
                subject: 'Promotly: Giriş bağlantın',
                html: mailLayout(
                    'Promotly',
                    '<p>Hesabına girmek için aşağıdaki bağlantıyı kullan. Bağlantı 48 saat geçerlidir ve tek kullanımlıktır.</p>',
                    { href: magicLink, label: 'Giriş yap' },
                ),
            });
            await trackEvent('magic_link_sent', { email: normalizedEmail, userId: user.id });
        } catch (emailError) {
            console.error('Magic link email failed:', emailError.message);
            return NextResponse.json({ error: 'E-posta gönderilemedi. Lütfen tekrar deneyin.' }, { status: 502 });
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Sistem hatası.' }, { status: 500 });
    }
}
