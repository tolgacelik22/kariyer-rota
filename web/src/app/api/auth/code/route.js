import { NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { trackEvent } from '@/lib/tracking';
import { sendMail, mailConfigured, mailLayout } from '@/lib/mail';
import { KVKK_VERSION, getKvkkHash } from '@/lib/legal/kvkk';
import { codeHash } from '@/lib/loginCode';

// Mobile login step 1: email a 6-digit code (valid 10 minutes).
export async function POST(request) {
    try {
        const { email, kvkkAccepted, platform } = await request.json();
        const normalizedEmail = String(email || '').toLowerCase().trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
            return NextResponse.json({ error: 'Geçerli bir e-posta adresi gir.' }, { status: 400 });
        }

        const recent = await prisma.token.count({
            where: { user: { email: normalizedEmail }, createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) } },
        });
        if (recent >= 5) {
            return NextResponse.json({ error: 'Çok fazla deneme. Bir saat sonra tekrar dene.' }, { status: 429 });
        }

        let user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
        if (!user) {
            user = await prisma.user.create({ data: { email: normalizedEmail, utmSource: platform ? `app_${platform}` : 'app' } });
            await trackEvent('signup', { email: normalizedEmail, userId: user.id, properties: { source: 'app', platform } });
        }

        if (kvkkAccepted === true) {
            await prisma.consent.create({
                data: {
                    userId: user.id,
                    sessionId: 'app',
                    consentType: 'kvkk',
                    consentVersion: KVKK_VERSION,
                    textHash: getKvkkHash(),
                    accepted: true,
                    ip: (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() || null,
                    userAgent: request.headers.get('user-agent'),
                    source: 'app',
                },
            });
        }

        const code = String(crypto.randomInt(0, 1000000)).padStart(6, '0');
        await prisma.token.create({
            data: {
                hash: codeHash(normalizedEmail, code, crypto.randomBytes(8).toString('hex')),
                userId: user.id,
                type: 'login_code',
                expiresAt: new Date(Date.now() + 10 * 60 * 1000),
            },
        });

        if (!mailConfigured() && (process.env.NODE_ENV !== 'production' || process.env.DEMO_MODE === '1')) {
            return NextResponse.json({ success: true, devCode: code });
        }

        await sendMail({
            to: normalizedEmail,
            subject: `Promotly giriş kodun: ${code}`,
            html: mailLayout(
                'Giriş kodun',
                `<p>Uygulamaya bu kodu gir:</p><p style="font-size:32px;font-weight:800;letter-spacing:8px;color:#0f172a">${code}</p><p>Kod 10 dakika geçerlidir. Bu isteği sen yapmadıysan bu e-postayı yok sayabilirsin.</p>`,
            ),
        });
        await trackEvent('login_code_sent', { email: normalizedEmail, userId: user.id });
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Login code error:', err);
        return NextResponse.json({ error: 'Kod gönderilemedi. Lütfen tekrar dene.' }, { status: 500 });
    }
}
