import { NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function POST(request) {
    console.log('PDF: Starting generation with pdf-lib');
    try {
        let answers = {};
        try {
            const payload = await request.json();
            answers = payload.answers || {};
        } catch (e) {
            console.error('PDF: JSON parse error', e);
        }

        // Create a new PDFDocument
        const pdfDoc = await PDFDocument.create();

        // Standard fonts in pdf-lib do NOT require external files
        const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

        // Add a blank page to the document
        const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
        const { width, height } = page.getSize();

        // Draw Title
        page.drawText('Kariyer On Analiz Raporu', {
            x: 50,
            y: height - 80,
            size: 24,
            font: helveticaBold,
            color: rgb(0.12, 0.23, 0.54), // #1f3a8a
        });

        // Date & Seniority
        const dateStr = new Date().toLocaleDateString('tr-TR');
        const seniority = answers.seniority || 'Belirtilmedi';

        page.drawText(`Tarih: ${dateStr}`, { x: 50, y: height - 120, size: 12, font: helvetica, color: rgb(0.3, 0.3, 0.3) });
        page.drawText(`Seviye: ${seniority}`, { x: 50, y: height - 135, size: 12, font: helvetica, color: rgb(0.3, 0.3, 0.3) });

        // Section 1
        page.drawText('1. Temel Tespit', { x: 50, y: height - 180, size: 16, font: helveticaBold, color: rgb(0, 0, 0) });
        page.drawText('Tecrübe seviyenize oranla sorumluluk ve yetki dengesinin bozulduğu görülmektedir.', {
            x: 50,
            y: height - 205,
            size: 11,
            font: helvetica,
            color: rgb(0.4, 0.4, 0.4),
            maxWidth: 500,
            lineHeight: 14,
        });

        // Section 2
        page.drawText('2. İletişim Bariyeri', { x: 50, y: height - 250, size: 16, font: helveticaBold, color: rgb(0, 0, 0) });
        page.drawText('Zorlandığınız konu, genellikle üst yönetimle olan "değer kanıtlama" eksikliğinden gelmektedir.', {
            x: 50,
            y: height - 275,
            size: 11,
            font: helvetica,
            color: rgb(0.4, 0.4, 0.4),
            maxWidth: 500,
            lineHeight: 14,
        });

        // Premium Box
        const boxY = height - 400;
        page.drawRectangle({
            x: 50,
            y: boxY,
            width: 500,
            height: 100,
            color: rgb(0.98, 0.98, 0.98),
            borderColor: rgb(0.12, 0.23, 0.54),
            borderWidth: 1,
        });

        page.drawText('PREMIUM RAPORDA SİZİ NELER BEKLİYOR?', {
            x: 70,
            y: boxY + 70,
            size: 12,
            font: helveticaBold,
            color: rgb(0.12, 0.23, 0.54),
        });

        page.drawText('- Yanlış Yapılan 5 Kritik Stratejik Hata', { x: 70, y: boxY + 50, size: 10, font: helvetica, color: rgb(0.4, 0.4, 0.4) });
        page.drawText('- 90 Günlük Net Aksiyon Planı', { x: 70, y: boxY + 35, size: 10, font: helvetica, color: rgb(0.4, 0.4, 0.4) });

        // Serialize the PDFDocument to bytes (a Uint8Array)
        const pdfBytes = await pdfDoc.save();

        console.log('PDF: Generation successful with pdf-lib');

        return new NextResponse(pdfBytes, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="kariyer-on-rapor.pdf"',
                'Content-Length': pdfBytes.length.toString(),
            },
        });

    } catch (err) {
        console.error('PDF: Fatal error with pdf-lib', err);
        return NextResponse.json({ error: 'Internal Server Error', details: err.message }, { status: 500 });
    }
}
