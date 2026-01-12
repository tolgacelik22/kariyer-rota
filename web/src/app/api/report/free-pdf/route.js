import { NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import path from 'path';
import fs from 'fs';

// Turkish character mapping for fallback
const trMap = {
    'ğ': 'g', 'Ğ': 'G', 'ş': 's', 'Ş': 'S', 'ı': 'i', 'İ': 'I', 'ö': 'o', 'Ö': 'O', 'ç': 'c', 'Ç': 'C', 'ü': 'u', 'Ü': 'U'
};

function safeTr(text) {
    if (!text) return '';
    return text.toString().replace(/[ğĞşŞıİöÖçÇüÜ]/g, m => trMap[m] || m);
}

export async function POST(request) {
    console.log('PDF: Advanced generation starting');
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

        let font;
        let fontLoaded = false;

        // Try to load custom font
        try {
            const fontPath = path.join(process.cwd(), 'public/fonts/Roboto-Regular.ttf');
            if (fs.existsSync(fontPath)) {
                const fontBytes = fs.readFileSync(fontPath);
                font = await pdfDoc.embedFont(fontBytes);
                fontLoaded = true;
                console.log('PDF: Roboto font loaded successfully');
            }
        } catch (e) {
            console.error('PDF: Custom font load failed, falling back to Helvetica', e.message);
        }

        // If custom font failed, use Helvetica (which doesn't support TR chars in PDF-lib)
        if (!fontLoaded) {
            font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        }

        const page = pdfDoc.addPage([595.28, 841.89]);
        const { width, height } = page.getSize();

        // Helper to draw text with fallback for encoding
        const drawLine = (text, x, y, size, isBold = false) => {
            try {
                page.drawText(fontLoaded ? text : safeTr(text), {
                    x, y, size, font,
                    color: rgb(options?.r || 0, options?.g || 0, options?.b || 0)
                });
            } catch (err) {
                // If it still fails (even with custom font), force sanitize
                page.drawText(safeTr(text), { x, y, size, font });
            }
        };

        // Header
        const title = fontLoaded ? 'Kariyer Ön Analiz Raporu' : 'Kariyer On Analiz Raporu';
        page.drawText(title, {
            x: 50, y: height - 80, size: 22, font,
            color: rgb(0.12, 0.23, 0.54),
        });

        const dateStr = new Date().toLocaleDateString('tr-TR');
        const seniority = answers.seniority || 'Belirtilmedi';

        page.drawText(`Tarih: ${dateStr}`, { x: 50, y: height - 120, size: 11, font });
        page.drawText(`Seviye: ${fontLoaded ? seniority : safeTr(seniority)}`, { x: 50, y: height - 135, size: 11, font });

        // Body sections
        const drawBodySection = (title, content, startY) => {
            page.drawText(fontLoaded ? title : safeTr(title), { x: 50, y: startY, size: 15, font, color: rgb(0, 0, 0) });
            page.drawText(fontLoaded ? content : safeTr(content), {
                x: 50, y: startY - 25, size: 10, font, color: rgb(0.4, 0.4, 0.4),
                maxWidth: 500, lineHeight: 14
            });
        };

        drawBodySection('1. Temel Tespit', 'Tecrübe seviyenize oranla sorumluluk ve yetki dengesinin bozulduğu görülmektedir. Bu durum piyasa değerinizi baskılayan bir plato etkisi yaratır.', height - 180);
        drawBodySection('2. İletişim Bariyeri', 'Zorlandığınız konu, genellikle üst yönetimle olan "değer kanıtlama" eksikliğinden gelmektedir. Görünür olmayan başarı, müzakere masasında argüman kaybına neden olur.', height - 260);

        // Premium Box
        const boxY = height - 420;
        page.drawRectangle({ x: 50, y: boxY, width: 500, height: 100, color: rgb(0.98, 0.98, 0.98), borderColor: rgb(0.12, 0.23, 0.54), borderWidth: 1 });
        page.drawText('PREMIUM RAPORDA SIZI NELER BEKLIYOR?', { x: 70, y: boxY + 70, size: 12, font, color: rgb(0.12, 0.23, 0.54) });
        page.drawText('- Yanlis Yapilan 5 Kritik Stratejik Hata', { x: 70, y: boxY + 45, size: 9, font });
        page.drawText('- 90 Gunluk Net Aksiyon Plani', { x: 70, y: boxY + 30, size: 9, font });

        const pdfBytes = await pdfDoc.save();
        console.log('PDF: Generation complete, fontLoaded:', fontLoaded);

        return new NextResponse(pdfBytes, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="kariyer-on-rapor.pdf"',
                'Content-Length': pdfBytes.length.toString(),
            },
        });

    } catch (err) {
        console.error('PDF: Critical failure', err);
        return NextResponse.json({
            error: 'Internal Server Error',
            details: err.message
        }, { status: 500 });
    }
}
