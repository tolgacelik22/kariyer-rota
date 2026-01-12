import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import ReportClient from './ReportClient';

async function getContext(searchParams) {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    const surveyId = searchParams.id;

    if (!surveyId) return { survey: null, isPremium: false };

    let isPremium = false;
    let email = null;

    // 1. Try to get email from JWT token (auth cookie)
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            email = decoded.email;
        } catch (e) {
            console.error('JWT verify failed', e);
        }
    }

    // 2. Fetch the Survey Result
    const survey = await prisma.surveyResult.findUnique({
        where: { id: surveyId },
    });

    if (!survey) return { survey: null, isPremium: false };

    // 3. Check if this specific report is unlocked for this email
    if (email) {
        const entitlement = await prisma.premiumEntitlement.findUnique({
            where: {
                email_reportId: { email, reportId: surveyId }
            }
        });
        if (entitlement) isPremium = true;
    }

    return { survey, isPremium };
}

export default async function ReportPage(props) {
    const searchParams = await props.searchParams;
    const { survey, isPremium } = await getContext(searchParams);

    if (!survey) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-4">
                <h1 className="text-xl font-bold">Rapor Bulunamadı</h1>
                <p className="text-gray-500">Lütfen quizi tekrar çözün veya destek ile iletişime geçin.</p>
                <a href="/" className="bg-[#1f3a8a] text-white px-8 py-3 rounded-xl font-bold">Quizi Başlat</a>
            </div>
        );
    }

    return (
        <ReportClient survey={survey} isPremium={isPremium} />
    );
}
