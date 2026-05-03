// Map productId -> liste de dates ISO indisponibles (mock).
// Les dates sont relatives à "aujourd'hui" pour rester pertinentes.
import { addDays, format } from 'date-fns';

const today = new Date();
const iso = (d: Date) => format(d, 'yyyy-MM-dd');

export const UNAVAILABLE_DATES: Record<string, string[]> = {
  '1': [iso(addDays(today, 3)), iso(addDays(today, 4)), iso(addDays(today, 10))],
  '2': [iso(addDays(today, 5)), iso(addDays(today, 12))],
  '3': [iso(addDays(today, 7))],
};

export function isDateUnavailable(productId: string, date: Date): boolean {
  const list = UNAVAILABLE_DATES[productId] ?? [];
  return list.includes(iso(date));
}
