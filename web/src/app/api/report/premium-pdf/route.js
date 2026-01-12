import { NextResponse } from 'next/server';
import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import path from 'path';
import fs from 'fs';
import prisma from '@/lib/prisma';

// Turkish character mapping for fallback
const trMap = {
    'ğ': 'g', 'Ğ': 'G', 'ş': 's', 'Ş': 'S', 'ı': 'i', 'İ': 'I', 'ö': 'o', 'Ö': 'O', 'ç': 'c', 'Ç': 'C', 'ü': 'u', 'Ü': 'U'
};

function safeTr(text) {
    if (!text) return '';
    return text.toString().replace(/[ğĞşŞıİöÖçÇüÜ]/g, m => trMap[m] || m);
}

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderid');

    console.log('Premium PDF: Request for order', orderId);

    if (!orderId) {
        return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    try {
        // Verify order exists and is associated with a user
        const order = await prisma.shopierOrder.findUnique({
            where: { orderId: String(orderId) },
            include: { user: { include: { surveyResults: { orderBy: { createdAt: 'desc' }, take: 1 } } } }
        });

        if (!order || !order.user) {
            console.error('Premium PDF: Order not found or user not linked', orderId);
            return NextResponse.json({ error: 'Valid order not found or user not linked.' }, { status: 404 });
        }

        const survey = order.user.surveyResults[0];
        const answers = survey?.rawAnswers || {};

        const pdfDoc = await PDFDocument.create();
        pdfDoc.registerFontkit(fontkit);

        let font;
        let fontLoaded = false;
        try {
            const fontPath = path.join(process.cwd(), 'public/fonts/Roboto-Regular.ttf');
            if (fs.existsSync(fontPath)) {
                const fontBytes = fs.readFileSync(fontPath);
                font = await pdfDoc.embedFont(fontBytes);
                fontLoaded = true;
            }
        } catch (e) {
            console.error('Premium PDF: Font load failed', e.message);
        }

        if (!fontLoaded) {
            // Fallback font - will need character sanitization
            font = await pdfDoc.embedStandardFont('Helvetica');
        }

        const page = pdfDoc.addPage([595.28, 841.89]);
        const { width, height } = page.getSize();

        const writeText = (text, x, y, size, color = rgb(0, 0, 0)) => {
            page.drawText(fontLoaded ? text : safeTr(text), {
                x, y, size, font, color
            });
        };

        // Title
        writeText('Premium Stratejik Kariyer Raporu', 50, height - 80, 22, rgb(0.12, 0.23, 0.54));

        // Info
        const dateStr = new Date().toLocaleDateString('tr-TR');
        writeText(`Tarih: ${dateStr}`, 50, height - 120, 10, rgb(0.4, 0.4, 0.4));
        writeText(`Sipariş No: ${orderId}`, 50, height - 135, 10, rgb(0.4, 0.4, 0.4));
        writeText(`E-posta: ${order.email}`, 50, height - 150, 10, rgb(0.4, 0.4, 0.4));

        // Detailed Content
        const drawSection = (title, content, startY) => {
            writeText(title, 50, startY, 15, rgb(0, 0, 0));

            // Multiline content handling
            const words = (fontLoaded ? content : safeTr(content)).split(' ');
            let line = '';
            let currentY = startY - 25;
            for (const word of words) {
                if ((line + word).length > 85) {
                    writeText(line, 50, currentY, 10, rgb(0.2, 0.2, 0.2));
                    line = word + ' ';
                    currentY -= 15;
                } else {
                    line += word + ' ';
                }
            }
            writeText(line, 50, currentY, 10, rgb(0.2, 0.2, 0.2));
            return currentY - 30;
        };

        let nextY = height - 200;
        nextY = drawSection('1. Stratejik Hatalar ve Cozumler', 'Mevcut analizimize gore en buyuk hataniz reaktif kalmaktir. Pazar degerinizi kanitlayacak verileri ust yonetime sunarken duygusal degil rakamsal bir dil kullanmalisiniz. Ozellikle son 6 aydaki projelerinizin finansal etkisini cikarin.', nextY);
        nextY = drawSection('2. Muzakere Teknikleri', 'Bir sonraki gorusmenizde "Maas artisi istiyorum" yerine "Sirkete kattigim bu X deger karsiliginda piyasa baremlerine uyumlanmak istiyorum" cumlesini kurun. Bu yaklasim sizi isteyen degil, hak alici konumuna sokar.', nextY);
        nextY = drawSection('3. 90 Gunluk Aksiyon Plani', 'Onumuzdeki 30 gun boyunca gorunurlugunuzu artirin (KPI sunumlari yapin). 60. gunde beklentilerinizi ve basarilarinizi yoneticinizle paylasin. 90. gunde ise resmi teklif masanizi kurun.', nextY);

        const pdfBytes = await pdfDoc.save();

        return new NextResponse(pdfBytes, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="kariyer-premium-rapor-${orderId}.pdf"`,
                'Content-Length': pdfBytes.length.toString(),
            },
        });

    } catch (err) {
        console.error('Premium PDF Final Error:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
