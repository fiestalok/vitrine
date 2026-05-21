import { eachDayOfInterval, format, startOfDay } from 'date-fns';

const iso = (d: Date) => format(d, 'yyyy-MM-dd');

const today = startOfDay(new Date());
const until = new Date('2026-06-22');

export const UNAVAILABLE_UNTIL_JUNE_22 = eachDayOfInterval({ start: today, end: until }).map(iso);

export const UNAVAILABLE_DATES: Record<string, string[]> = {};

export function isDateUnavailable(_productId: string, date: Date): boolean {
  return UNAVAILABLE_UNTIL_JUNE_22.includes(iso(date));
}
