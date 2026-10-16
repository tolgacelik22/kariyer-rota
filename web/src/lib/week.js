// Weeks are keyed by their Monday in Europe/Istanbul (UTC+3, no DST),
// stored as that calendar date at 00:00 UTC.
const TR_OFFSET_MS = 3 * 60 * 60 * 1000;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function weekStartOf(date = new Date()) {
    const d = new Date(new Date(date).getTime() + TR_OFFSET_MS);
    const diff = (d.getUTCDay() + 6) % 7;
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - diff));
}

export function addWeeks(date, n) {
    return new Date(new Date(date).getTime() + n * WEEK_MS);
}

export function weeksBetween(a, b) {
    return Math.round((weekStartOf(b) - weekStartOf(a)) / WEEK_MS);
}

export function formatWeek(weekStart) {
    const start = new Date(weekStart);
    const end = addWeeks(start, 1);
    end.setUTCDate(end.getUTCDate() - 3); // Friday
    const fmt = (d, opts) => d.toLocaleDateString('tr-TR', { timeZone: 'UTC', ...opts });
    return `${fmt(start, { day: 'numeric', month: 'short' })} – ${fmt(end, { day: 'numeric', month: 'short', year: 'numeric' })}`;
}

// Consecutive logged weeks ending this week (or last week, if this week isn't logged yet).
export function currentStreak(weekStarts, now = new Date()) {
    const keys = new Set(weekStarts.map((w) => new Date(w).getTime()));
    let cursor = weekStartOf(now);
    if (!keys.has(cursor.getTime())) cursor = addWeeks(cursor, -1);
    let streak = 0;
    while (keys.has(cursor.getTime())) {
        streak++;
        cursor = addWeeks(cursor, -1);
    }
    return streak;
}
