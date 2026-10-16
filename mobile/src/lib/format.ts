const DAY = 24 * 60 * 60 * 1000;

export function weekRange(weekStart: string) {
  const start = new Date(weekStart);
  const end = new Date(start.getTime() + 4 * DAY);
  const f = (d: Date, o: Intl.DateTimeFormatOptions) => d.toLocaleDateString('tr-TR', { timeZone: 'UTC', ...o });
  const sameMonth = start.getUTCMonth() === end.getUTCMonth();
  return sameMonth
    ? `${f(start, { day: 'numeric' })}–${f(end, { day: 'numeric', month: 'short' })}`
    : `${f(start, { day: 'numeric', month: 'short' })} – ${f(end, { day: 'numeric', month: 'short' })}`;
}

export function weekLabel(weekStart: string, currentWeek: string) {
  const diff = Math.round((new Date(currentWeek).getTime() - new Date(weekStart).getTime()) / (7 * DAY));
  if (diff === 0) return 'Bu hafta';
  if (diff === 1) return 'Geçen hafta';
  return `${diff} hafta önce`;
}

export function monthKey(weekStart: string) {
  return new Date(weekStart).toLocaleDateString('tr-TR', { timeZone: 'UTC', month: 'long', year: 'numeric' });
}

export function longDate(d: string) {
  return new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
}

// Days until the coming Friday in Istanbul time (0 on Friday).
export function daysToFriday(now = new Date()) {
  const tr = new Date(now.getTime() + 3 * 60 * 60 * 1000).getUTCDay();
  return (5 - tr + 7) % 7;
}

export function greeting(now = new Date()) {
  const h = new Date(now.getTime() + 3 * 60 * 60 * 1000).getUTCHours();
  if (h < 6) return 'İyi geceler';
  if (h < 12) return 'Günaydın';
  if (h < 18) return 'İyi günler';
  return 'İyi akşamlar';
}

export const MOODS = ['😣', '😕', '😐', '🙂', '🤩'];
