import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import { trackEvent } from '@/lib/tracking';
import ReportClient from './ReportClient';

async function getUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) return null;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            include: { surveyResults: { orderBy: { createdAt: 'desc' }, take: 1 } }
        });

        if (user) {
            await trackEvent('report_viewed', { userId: user.id, email: user.email });
            if (!user.isPremium) await trackEvent('paywall_viewed', { userId: user.id, email: user.email });
        }

        return user;
    } catch (err) {
        return null;
    }
}

export default async function ReportPage() {
    const user = await getUser();

    if (!user) {
        redirect('/');
    }

    const survey = user.surveyResults[0];
    const isPremium = user.isPremium;

    return (
        <ReportClient user={user} survey={survey} isPremium={isPremium} />
    );
}
