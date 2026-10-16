// Browser helpers shared by /app pages.
export async function api(path, { method = 'GET', body } = {}) {
    const res = await fetch(path, {
        method,
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (res.status === 401) {
        window.location.href = '/giris';
        throw new Error('Oturum kapandı.');
    }
    if (!res.ok) {
        const err = new Error(data.error || 'Bir hata oluştu.');
        err.paywall = data.paywall;
        throw err;
    }
    return data;
}

export function formatWeekClient(weekStart) {
    const start = new Date(weekStart);
    const end = new Date(start.getTime() + 4 * 24 * 60 * 60 * 1000);
    const fmt = (d, opts) => d.toLocaleDateString('tr-TR', { timeZone: 'UTC', ...opts });
    return `${fmt(start, { day: 'numeric', month: 'short' })} – ${fmt(end, { day: 'numeric', month: 'short', year: 'numeric' })}`;
}

export function formatDate(d) {
    return new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
}
