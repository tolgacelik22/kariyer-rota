import { NextResponse } from 'next/server';
import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import path from 'path';
import fs from 'fs';

export async function POST(request) {
    console.log('PDF: Character-safe generation starting');
    try {
        let answers = {};
        try {
            const payload = await request.json();
            answers = payload.answers || {};
        } catch (e) {
            console.error('PDF: JSON parse error', e);
        }

        const pdfDoc = await PDFDocument.create();
        pdfDoc.registerFontkit(fontkit);

        // Load Turkish-supported font (Inter)
        const fontPath = path.join(process.cwd(), 'public/fonts/Inter-Regular.ttf');
        if (!fs.existsSync(fontPath)) {
            throw new Error('Font file not found at ' + fontPath);
        }

        const fontBytes = fs.readFileSync(fontPath);
        const customFont = await pdfDoc.embedFont(fontBytes);

        const page = pdfDoc.addPage([595.28, 841.89]); // A4
        const { width, height } = page.getSize();

        // Title
        page.drawText('Kariyer Ön Analiz Raporu', {
            x: 50,
            y: height - 80,
            size: 22,
            font: customFont,
            color: rgb(0.12, 0.23, 0.54),
        });

        const seniority = answers.seniority || 'Belirtilmedi';
        const dateStr = new Date().toLocaleDateString('tr-TR');

        page.drawText(`Tarih: ${dateStr}`, { x: 50, y: height - 120, size: 11, font: customFont, color: rgb(0.3, 0.3, 0.3) });
        page.drawText(`Seviye: ${seniority}`, { x: 50, y: height - 135, size: 11, font: customFont, color: rgb(0.3, 0.3, 0.3) });

        // Section 1
        page.drawText('1. Temel Tespit', { x: 50, y: height - 180, size: 15, font: customFont, color: rgb(0, 0, 0) });
        page.drawText('Tecrübe seviyenize oranla sorumluluk ve yetki dengesinin bozulduğu görülmektedir. Bu durum piyasa değerinizi baskılayan bir plato etkisi yaratır.', {
            x: 50,
            y: height - 210,
            size: 10,
            font: customFont,
            color: rgb(0.4, 0.4, 0.4),
            maxWidth: 500,
            lineHeight: 14,
        });

        // Section 2
        page.drawText('2. İletişim Bariyeri', { x: 50, y: height - 260, size: 15, font: customFont, color: rgb(0, 0, 0) });
        page.drawText('Zorlandığınız konu, genellikle üst yönetimle olan "değer kanıtlama" eksikliğinden gelmektedir. Görünür olmayan başarı, müzakere masasında argüman kaybına neden olur.', {
            x: 50,
            y: height - 290,
            size: 10,
            font: customFont,
            color: rgb(0.4, 0.4, 0.4),
            maxWidth: 500,
            lineHeight: 14,
        });

        // Premium Box
        const boxY = height - 420;
        page.drawRectangle({
            x: 50, y: boxY, width: 500, height: 100,
            color: rgb(0.98, 0.98, 0.98), borderColor: rgb(0.12, 0.23, 0.54), borderWidth: 1,
        });

        page.drawText('PREMIUM RAPORDA SİZİ NELER BEKLİYOR?', {
            x: 70, y: boxY + 70, size: 12, font: customFont, color: rgb(0.12, 0.23, 0.54),
        });

        page.drawText('• Yanlış Yapılan 5 Kritik Stratejik Hata', { x: 70, y: boxY + 45, size: 9, font: customFont, color: rgb(0.4, 0.4, 0.4) });
        page.drawText('• 90 Günlük Net Aksiyon Planı', { x: 70, y: boxY + 30, size: 9, font: customFont, color: rgb(0.4, 0.4, 0.4) });

        const pdfBytes = await pdfDoc.save();
        console.log('PDF: Generation complete with custom font support');

        return new NextResponse(pdfBytes, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="kariyer-on-rapor.pdf"',
                'Content-Length': pdfBytes.length.toString(),
            },
        });

    } catch (err) {
        console.error('PDF: Encoding/Font error', err);
        return NextResponse.json({ error: 'Internal Server Error', details: err.message }, { status: 500 });
    }
}
