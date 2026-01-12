import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

import crypto from 'crypto';
import { trackEvent } from '@/lib/tracking';

export async function POST(request) {
    try {
        const { email, surveyId, utms } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Rate Limiting Check (Simple DB based)
        const recentTokens = await prisma.token.count({
            where: {
                user: { email: normalizedEmail },
                createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) } // last hour
            }
        });

        if (recentTokens >= 5) {
            return NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 });
        }

        // Find or create user
        let user = await prisma.user.findUnique({
            where: { email: normalizedEmail },
        });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    email: normalizedEmail,
                    utmSource: utms?.utm_source,
                    utmMedium: utms?.utm_medium,
                    utmCampaign: utms?.utm_campaign,
                },
            });
        }

        // Link survey result to user if exists
        if (surveyId) {
            await prisma.surveyResult.updateMany({
                where: { id: surveyId, userId: null },
                data: { userId: user.id },
            });
        }

        // Generate Secure Token
        const rawToken = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

        await prisma.token.create({
            data: {
                hash: tokenHash,
                userId: user.id,
                type: 'magic_link',
                expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48h
            }
        });

        const magicLink = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/verify?token=${rawToken}`;

        // Send Email (Fire and forget, but wait for log)
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: process.env.SMTP_PORT === '465',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        const mailOptions = {
            from: process.env.SMTP_FROM,
            to: normalizedEmail,
            subject: 'Kariyer Rota: Giriş Bağlantınız',
            html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 40px; border-radius: 8px;">
          <h2 style="color: #1f3a8a; margin-top: 0;">Kariyer Rota</h2>
          <p style="font-size: 16px; line-height: 1.6; color: #444;">Analiz raporunuza erişmek için aşağıdaki bağlantıyı kullanabilirsiniz. Bu bağlantı 48 saat boyunca geçerlidir ve tek seferliktir.</p>
          <div style="margin: 32px 0;">
            <a href="${magicLink}" style="background-color: #1f3a8a; color: white; padding: 16px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">Raporu Görüntüle</a>
          </div>
          <p style="font-size: 12px; color: #999;">Bağlantıya tıklayamıyorsanız kopyalayıp tarayıcınıza yapıştırın:<br>${magicLink}</p>
        </div>
      `,
        };

        try {
            await transporter.sendMail(mailOptions);
            await trackEvent('magic_link_sent', { email: normalizedEmail, userId: user.id });
        } catch (emailError) {
            console.error('Email failed, link:', magicLink);
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
