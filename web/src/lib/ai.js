// AI layer: OpenAI chat completions when OPENAI_API_KEY is set, deterministic templates otherwise.
import { formatWeek } from './week';

const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

async function complete(system, user, maxTokens = 1800) {
    if (!process.env.OPENAI_API_KEY) return null;
    try {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
            body: JSON.stringify({
                model: MODEL,
                temperature: 0.4,
                max_tokens: maxTokens,
                messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
            }),
            signal: AbortSignal.timeout(60000),
        });
        if (!res.ok) {
            console.error('AI request failed', res.status, (await res.text()).slice(0, 300));
            return null;
        }
        const data = await res.json();
        return data.choices?.[0]?.message?.content?.trim() || null;
    } catch (err) {
        console.error('AI request error', err.message);
        return null;
    }
}

const BASE_SYSTEM = `Sen Promotly'nin kariyer asistanısın. Türkçe, profesyonel ve somut yazarsın.
Kurallar:
- Yalnızca kullanıcının kayıtlarındaki bilgileri kullan; rakam, proje veya sonuç uydurma.
- Ölçülebilir etkileri (%, süre, tutar, adet) öne çıkar; yoksa "ölçüm eklenmeli" diye işaretle.
- Kanıt bağlantılarını ilgili maddenin yanında [kanıt](url) olarak koru.
- Çıktı Markdown olsun: ## başlıklar, - maddeler, **kalın** vurgular. Giriş/kapanış cümlesi yazma.`;

const REPORT_PROMPTS = {
    monthly: 'Son 4 haftanın aylık özetini çıkar. Bölümler: ## Öne çıkan çıktılar, ## Ölçülebilir katkılar, ## Zorluklar ve çözümler, ## Gelecek ay odak.',
    quarterly: 'Son çeyreğin hedef ve gelişim analizini yaz. Bölümler: ## Çeyrek özeti, ## Tekrarlayan temalar ve güçlü yönler, ## Gelişim alanları, ## Önümüzdeki çeyrek için 3 hedef (ölçülebilir).',
    review: 'Altı aylık performans ve terfi dosyası hazırla; kullanıcı bunu yöneticisiyle görüşmede kullanacak. Bölümler: ## Yönetici özeti (3-4 cümle), ## En önemli 5 katkı (her biri: ne yapıldı, etkisi, kanıt), ## Yetkinlikler ve gözlemlenen davranışlar, ## Liderlik ve iş birliği, ## Terfi gerekçesi, ## Görüşmede sorulabilecek sorular ve hazır cevaplar.',
    stories: 'CV ve mülakatlar için STAR formatında 4-6 başarı hikâyesi çıkar. Her hikâye: ### Başlık, **Durum**, **Görev**, **Aksiyon**, **Sonuç** (ölçülebilir), ardından CV için tek satırlık madde. En sonda ## CV maddeleri listesi.',
};

export const REPORT_TYPES = {
    monthly: { label: 'Aylık özet', weeks: 4, pro: false },
    quarterly: { label: 'Çeyrek analizi', weeks: 13, pro: true },
    review: { label: 'Performans & terfi dosyası', weeks: 26, pro: true },
    stories: { label: 'Başarı hikâyeleri (CV / mülakat)', weeks: 52, pro: true },
};

function entryToText(e) {
    const lines = [`### Hafta: ${formatWeek(e.weekStart)}`, `Yapılanlar: ${e.wins}`];
    if (e.impact) lines.push(`Etki / ölçüm: ${e.impact}`);
    if (e.challenges) lines.push(`Zorluklar: ${e.challenges}`);
    if (e.learnings) lines.push(`Öğrenilenler: ${e.learnings}`);
    if (e.nextWeek) lines.push(`Gelecek hafta planı: ${e.nextWeek}`);
    if (e.tags?.length) lines.push(`Etiketler: ${e.tags.join(', ')}`);
    if (e.links?.length) lines.push(`Kanıtlar: ${e.links.join(' ')}`);
    return lines.join('\n');
}

function profileLine(user) {
    return [user.name && `Ad: ${user.name}`, user.jobTitle && `Pozisyon: ${user.jobTitle}`].filter(Boolean).join(' · ');
}

export async function weeklySummary(entry, user) {
    return complete(
        BASE_SYSTEM,
        `${profileLine(user)}\nBu haftalık kaydı yöneticiye iletilecek 3 maddelik bir özete çevir. Her madde "- " ile başlayan, birinci tekil şahıs geçmiş zamanlı tek bir cümle olsun (ör. "- Ödeme hatalarını %68 azaltan yeniden deneme mekanizmasını canlıya aldım."); "Fiil:" gibi etiket koyma. İlgili etkiyi aynı maddeye bağla. Başlık kullanma.\n\n${entryToText(entry)}`,
        400,
    );
}

export async function buildReport(type, user, entries) {
    const ordered = [...entries].sort((a, b) => new Date(a.weekStart) - new Date(b.weekStart));
    const ai = await complete(
        BASE_SYSTEM,
        `${profileLine(user)}\n${REPORT_PROMPTS[type]}\n\nHaftalık kayıtlar (${ordered.length} hafta):\n\n${ordered.map(entryToText).join('\n\n')}`,
    );
    if (ai) return { content: ai, source: 'ai' };
    return { content: templateReport(type, ordered), source: 'template' };
}

function bullets(items) {
    return items.length ? items.map((s) => `- ${s}`).join('\n') : '- _Kayıt yok_';
}

function splitLines(text) {
    return String(text || '').split(/\n|;|•/).map((s) => s.replace(/^[-*\s]+/, '').trim()).filter(Boolean);
}

// Basic summary without AI: groups what the user wrote, keeps evidence links.
export function templateReport(type, entries) {
    const wins = [];
    const impacts = [];
    const challenges = [];
    const plans = [];
    const tagCount = {};
    for (const e of entries) {
        const week = formatWeek(e.weekStart);
        const evidence = e.links?.length ? ' ' + e.links.map((l) => `[kanıt](${l})`).join(' ') : '';
        splitLines(e.wins).forEach((w) => wins.push(`${w} _(${week})_${evidence}`));
        splitLines(e.impact).forEach((w) => impacts.push(w));
        splitLines(e.challenges).forEach((w) => challenges.push(w));
        (e.tags || []).forEach((t) => { tagCount[t] = (tagCount[t] || 0) + 1; });
    }
    const last = entries[entries.length - 1];
    if (last?.nextWeek) plans.push(...splitLines(last.nextWeek));
    const topTags = Object.entries(tagCount).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([t, n]) => `${t} (${n} hafta)`);

    return [
        `## ${REPORT_TYPES[type]?.label || 'Özet'} — ${entries.length} haftalık kayıt`,
        '## Tamamlanan işler',
        bullets(wins),
        '## Ölçülebilir katkılar',
        bullets(impacts),
        '## Zorluklar',
        bullets(challenges),
        '## En çok çalışılan alanlar',
        bullets(topTags),
        '## Sonraki adımlar',
        bullets(plans),
        '_Bu temel özet AI olmadan, yalnızca kayıtlarındaki metinden derlendi. Pro ile yöneticiye hazır, kanıtlı AI raporu alırsın._',
    ].join('\n\n');
}
