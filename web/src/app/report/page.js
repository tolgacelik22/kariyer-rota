import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import { trackEvent } from '@/lib/tracking';
import ReportClient from './ReportClient';

async function getContext(searchParams) {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    const surveyId = searchParams.id;

    let user = null;
    let survey = null;
    let isPremium = false;

    // 1. Try to get user from token
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            user = await prisma.user.findUnique({
                where: { id: decoded.userId },
                include: { surveyResults: { orderBy: { createdAt: 'desc' }, take: 1 } }
            });
            if (user) {
                isPremium = user.isPremium;
                survey = user.surveyResults[0];
            }
        } catch (err) {
            console.error('JWT verify failed', err);
        }
    }

    // 2. Fallback to surveyId from query if no survey found for user
    if (!survey && surveyId) {
        survey = await prisma.surveyResult.findUnique({
            where: { id: surveyId },
        });
    }

    return { user, survey, isPremium };
}

export default async function ReportPage(props) {
    const searchParams = await props.searchParams;
    const { user, survey, isPremium } = await getContext(searchParams);

    // If still no survey, we can't show anything
    if (!survey) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-4">
                <h1 className="text-xl font-bold">Rapor Bulunamadı</h1>
                <p className="text-gray-500">Lütfen quizi tekrar çözün veya destek ile iletişime geçin.</p>
                <a href="/" className="bg-[#1f3a8a] text-white px-8 py-3 rounded-xl font-bold">Quizi Başlat</a>
            </div>
        );
    }

    // Identify viewing if possible
    if (user) {
        await trackEvent('report_viewed', { userId: user.id, email: user.email });
    }

    return (
        <ReportClient user={user} survey={survey} isPremium={isPremium} />
    );
}
