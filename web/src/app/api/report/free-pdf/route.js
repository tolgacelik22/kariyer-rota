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
        } catch (e) {
            console.error('PDF: JSON parse error', e);
        }

        const chunks = [];
        const doc = new PDFDocument({
            margin: 50,
            size: 'A4'
        });

        doc.on('data', chunk => chunks.push(chunk));

        const pdfPromise = new Promise((resolve, reject) => {
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);
        });

        // Safe font loading
        const fontPath = path.join(process.cwd(), 'public/fonts/Inter-Regular.ttf');
        if (fs.existsSync(fontPath)) {
            const fontBuffer = fs.readFileSync(fontPath);
            try {
                doc.font(fontBuffer);
                console.log('PDF: Custom font loaded from buffer');
            } catch (e) {
                console.error('PDF: Custom font buffer load failed', e);
                // Fallback will use Helvetica, which we fixed in Dockerfile
            }
        }

        // Content
        doc.fillColor('#1f3a8a').fontSize(22).text('Kariyer Ön Analiz Raporu', { align: 'center' });
        doc.moveDown(2);

        const seniority = answers.seniority || 'Belirtilmedi';
        doc.fillColor('#444').fontSize(12).text(`Tarih: ${new Date().toLocaleDateString('tr-TR')}`);
        doc.text(`Seviye: ${seniority}`);
        doc.moveDown();

        doc.fillColor('#000').fontSize(16).text('1. Temel Tespit');
        doc.fillColor('#666').fontSize(11).text('Tecrübe seviyenize oranla sorumluluk ve yetki dengesinin bozulduğu görülmektedir.');
        doc.moveDown();

        doc.fillColor('#000').fontSize(16).text('2. İletişim Bariyeri');
        doc.fillColor('#666').fontSize(11).text('Zorlandığınız konu, genellikle üst yönetimle olan "değer kanıtlama" eksikliğinden gelmektedir.');
        doc.moveDown(2);

        doc.rect(50, doc.y, 500, 80).fillAndStroke('#f9fafb', '#1f3a8a');
        doc.fillColor('#1f3a8a').fontSize(12).text('PREMIUM RAPORDA SİZİ NELER BEKLİYOR?', 70, doc.y - 65);

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
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
