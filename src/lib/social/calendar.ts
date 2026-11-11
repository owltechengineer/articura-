export function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Monday start
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function monthMatrix(year: number, month: number): Date[][] {
  const first = new Date(year, month, 1);
  const gridStart = startOfWeek(first);
  const weeks: Date[][] = [];
  let cursor = gridStart;
  for (let w = 0; w < 6; w++) {
    const week: Date[] = [];
    for (let d = 0; d < 7; d++) {
      week.push(new Date(cursor));
      cursor = addDays(cursor, 1);
    }
    weeks.push(week);
  }
  return weeks;
}

export function toDateTimeLocalValue(value: string | null | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

export function formatDayLabel(date: Date): string {
  return new Intl.DateTimeFormat("it-IT", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    timeZone: "Europe/Rome",
  }).format(date);
}

export function formatMonthTitle(year: number, month: number): string {
  return new Intl.DateTimeFormat("it-IT", {
    month: "long",
    year: "numeric",
    timeZone: "Europe/Rome",
  }).format(new Date(year, month, 1));
}
