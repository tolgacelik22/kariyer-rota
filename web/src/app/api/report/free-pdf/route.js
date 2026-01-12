import { NextResponse } from 'next/server';
import PDFDocument from 'pdfkit';

export async function POST(request) {
    try {
        const payload = await request.json().catch(() => ({}));
        const answers = payload.answers || {};

        // Create a basic PDF
        const doc = new PDFDocument({ margin: 50 });
        const chunks = [];

        doc.on('data', chunk => chunks.push(chunk));

        return new Promise((resolve) => {
            doc.on('error', (err) => {
                console.error('PDF Stream Error:', err);
                resolve(NextResponse.json({ error: 'PDF generation failed' }, { status: 500 }));
            });

            doc.on('end', () => {
                const pdfBuffer = Buffer.concat(chunks);
                resolve(new NextResponse(pdfBuffer, {
                    headers: {
                        'Content-Type': 'application/pdf',
                        'Content-Disposition': 'attachment; filename="kariyer-on-rapor.pdf"',
                        'Cache-Control': 'no-cache'
                    }
                }));
            });

            // Define result logic
            const seniorityLabel = {
                junior: 'Junior / Giriş Seviyesi',
                mid: 'Mid-Level / Orta Seviye',
                senior: 'Senior / Uzman',
                lead: 'Lead / Yönetici'
            }[answers.seniority] || 'Belirtilmedi';

            // Styling and Content
            doc.fontSize(20).fillColor('#1f3a8a').text('Kariyer Ön Analiz Raporu', { align: 'center' });
            doc.moveDown(2);

            doc.fontSize(12).fillColor('#444').text(`Tarih: ${new Date().toLocaleDateString('tr-TR')}`);
            doc.text(`Kıdem Seviyesi: ${seniorityLabel}`);
            doc.moveDown();

            doc.fontSize(14).fillColor('#000').text('1. Temel Tespit', { underline: true });
            doc.fontSize(11).fillColor('#666').text('Tecrübe seviyenize oranla sorumluluk ve yetki dengesinin bozulduğu görülmektedir. Bu durum piyasa değerinizi baskılayan bir plato etkisi yaratır.');
            doc.moveDown();

            doc.fontSize(14).fillColor('#000').text('2. İletişim Bariyeri', { underline: true });
            doc.fontSize(11).fillColor('#666').text('Zorlandığınız konu, genellikle üst yönetimle olan "değer kanıtlama" eksikliğinden gelmektedir. Görünür olmayan başarı, müzakere masasında argüman kaybına neden olur.');
            doc.moveDown(2);

            const rectY = doc.y;
            doc.rect(50, rectY, 500, 130).fillAndStroke('#f9fafb', '#1f3a8a');
            doc.fillColor('#1f3a8a').fontSize(12).font('Helvetica-Bold').text('PREMIUM RAPORDA SİZİ NELER BEKLİYOR?', 70, rectY + 20);
            doc.font('Helvetica').fillColor('#666').fontSize(10).text('- Yanlış Yapılan 5 Kritik Stratejik Hata', 70, doc.y + 10);
            doc.text('- Üst Yönetimle Konuşma Stratejisi (Cümle Örtekli)', 70, doc.y + 5);
            doc.text('- 90 Günlük Adım Adım Aksiyon Planı', 70, doc.y + 5);
            doc.text('- Piyasa Maaş Karşılaştırma Analizi', 70, doc.y + 5);

            doc.moveDown(5);
            const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://kariyer.magicdigital.org';
            doc.fillColor('#1f3a8a').fontSize(14).font('Helvetica-Bold').text('Detaylı Raporun Kilidini Açın', { align: 'center', link: baseUrl });
            doc.fontSize(10).font('Helvetica').fillColor('#999').text('kariyer.magicdigital.org', { align: 'center' });

            doc.end();
        });

    } catch (err) {
        console.error('PDF generation outer failed:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
