import { NextResponse } from 'next/server';
import PDFDocument from 'pdfkit';

export async function POST(request) {
    try {
        const { answers } = await request.json();

        // Create a basic PDF
        const doc = new PDFDocument({ margin: 50 });
        const chunks = [];

        doc.on('data', chunk => chunks.push(chunk));

        // Define result logic (sync with current reporting)
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

        doc.rect(50, doc.y, 500, 150).fillAndStroke('#f9fafb', '#1f3a8a');
        doc.fillColor('#1f3a8a').fontSize(12).text('PREMIUM RAPORDA SİZİ NELER BEKLİYOR?', 70, doc.y + 20, { font: 'Helvetica-Bold' });
        doc.fillColor('#666').fontSize(10).text('- Yanlış Yapılan 5 Kritik Stratejik Hata', 70, doc.y + 15);
        doc.text('- Üst Yönetimle Konuşma Stratejisi (Cümle Örnekli)', 70, doc.y + 5);
        doc.text('- 90 Günlük Adım Adım Aksiyon Planı', 70, doc.y + 5);
        doc.text('- Piyasa Maaş Karşılaştırma Analizi', 70, doc.y + 5);

        doc.moveDown(4);
        doc.fillColor('#1f3a8a').fontSize(14).text('Detaylı Raporun Kilidini Açın', { align: 'center', link: process.env.NEXT_PUBLIC_BASE_URL });
        doc.fontSize(10).fillColor('#999').text('kariyer.magicdigital.org', { align: 'center' });

        doc.end();

        return new Promise((resolve) => {
            doc.on('end', () => {
                const pdfBuffer = Buffer.concat(chunks);
                resolve(new NextResponse(pdfBuffer, {
                    headers: {
                        'Content-Type': 'application/pdf',
                        'Content-Disposition': 'attachment; filename="kariyer-on-rapor.pdf"'
                    }
                }));
            });
        });

    } catch (err) {
        console.error('PDF generation failed:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
