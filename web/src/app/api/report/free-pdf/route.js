import { NextResponse } from 'next/server';
import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';

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

        // Use custom font to avoid AFM dependency issues in standalone
        const fontPath = path.join(process.cwd(), 'public/fonts/Inter-Regular.ttf');
        const hasFont = fs.existsSync(fontPath);
        console.log('PDF: Font check', { path: fontPath, exists: hasFont });

        if (hasFont) {
            doc.font(fontPath);
        }

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
        doc.fillColor('#1f3a8a').fontSize(22).text('Kariyer Ön Analiz Raporu', { align: 'center' });
        doc.moveDown(2);

        const seniority = answers.seniority || 'Belirtilmedi';
        doc.fillColor('#444').fontSize(12).text(`Tarih: ${new Date().toLocaleDateString('tr-TR')}`);
        doc.text(`Seviye: ${seniority}`);
        doc.moveDown();

        doc.fillColor('#000').fontSize(16).text('1. Temel Tespit');
        doc.fillColor('#666').fontSize(11).text('Tecrübe seviyenize oranla sorumluluk ve yetki dengesinin bozulduğu görülmektedir. Bu durum piyasa değerinizi baskılayan bir plato etkisi yaratır.');
        doc.moveDown();

        doc.fillColor('#000').fontSize(16).text('2. İletişim Bariyeri');
        doc.fillColor('#666').fontSize(11).text('Zorlandığınız konu, genellikle üst yönetimle olan "değer kanıtlama" eksikliğinden gelmektedir. Görünür olmayan başarı, müzakere masasında argüman kaybına neden olur.');
        doc.moveDown(2);

        doc.rect(50, doc.y, 500, 100).fillAndStroke('#f9fafb', '#1f3a8a');
        doc.fillColor('#1f3a8a').fontSize(12).text('PREMIUM RAPORDA SİZİ NELER BEKLİYOR?', 70, doc.y - 80);
        doc.fillColor('#666').fontSize(10).text('- Yanlış Yapılan 5 Kritik Stratejik Hata', 70, doc.y + 5);
        doc.text('- Üst Yönetimle Konuşma Stratejisi (Cümle Örtekli)', 70, doc.y + 5);
        doc.text('- 90 Günlük Adım Adım Aksiyon Planı', 70, doc.y + 5);

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
