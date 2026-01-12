import { NextResponse } from 'next/server';
import PDFDocument from 'pdfkit';

export async function POST(request) {
    console.log('PDF: Request received');
    try {
        let answers = {};
        try {
            const payload = await request.json();
            answers = payload.answers || {};
            console.log('PDF: Answers received', Object.keys(answers));
        } catch (e) {
            console.error('PDF: Failed to parse JSON body', e);
        }

        const chunks = [];
        const doc = new PDFDocument({
            margin: 50,
            size: 'A4',
            autoFirstPage: true
        });

        doc.on('data', chunk => chunks.push(chunk));

        const pdfPromise = new Promise((resolve, reject) => {
            doc.on('end', () => {
                console.log('PDF: Generation ended, chunks count:', chunks.length);
                const pdfBuffer = Buffer.concat(chunks);
                resolve(pdfBuffer);
            });
            doc.on('error', (err) => {
                console.error('PDF: Generation error', err);
                reject(err);
            });
        });

        // Content
        console.log('PDF: Adding content');
        doc.fontSize(20).text('Kariyer On Analiz Raporu', { align: 'center' });
        doc.moveDown();

        const seniority = answers.seniority || 'Belirtilmedi';
        doc.fontSize(12).text(`Tarih: ${new Date().toLocaleDateString('tr-TR')}`);
        doc.text(`Seviye: ${seniority}`);
        doc.moveDown();

        doc.fontSize(14).text('1. Temel Tespit');
        doc.fontSize(10).text('Tecrübe seviyenize oranla sorumluluk ve yetki dengesinin bozulduğu görülmektedir.');
        doc.moveDown();

        doc.fontSize(14).text('2. İletişim Bariyeri');
        doc.fontSize(10).text('Görünür olmayan başarı, müzakere masasında argüman kaybına neden olur.');
        doc.moveDown();

        doc.fontSize(12).text('Premium Raporda Neler Var?');
        doc.fontSize(10).text('- 90 Günlük Aksiyon Planı');
        doc.text('- Stratejik Cümle Kalıpları');

        doc.end();

        const buffer = await pdfPromise;

        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="kariyer-on-rapor.pdf"',
                'Content-Length': buffer.length.toString()
            }
        });

    } catch (err) {
        console.error('PDF: Fatal error', err);
        return NextResponse.json({
            error: 'Internal Server Error',
            details: err.message
        }, { status: 500 });
    }
}
