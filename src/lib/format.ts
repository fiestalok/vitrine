import { differenceInCalendarDays, parseISO, format } from 'date-fns';

export function formatPrice(amount: number): string {
  return `${amount}€/jour`;
}

export function rentalDays(startISO: string | null, endISO: string | null): number {
  if (!startISO) return 0;
  if (!endISO) return 1;
  const diff = differenceInCalendarDays(parseISO(endISO), parseISO(startISO));
  if (diff <= 0) return 1;
  return diff + 1;
}

export function lineTotal(
  unitPrice: number,
  startISO: string | null,
  endISO: string | null,
  quantity: number,
): number {
  return unitPrice * rentalDays(startISO, endISO) * quantity;
}

export function formatRange(startISO: string, endISO: string): string {
  const start = format(parseISO(startISO), 'dd/MM/yyyy');
  if (!endISO || startISO === endISO) return `Le ${start}`;
  const end = format(parseISO(endISO), 'dd/MM/yyyy');
  return `Du ${start} au ${end}`;
}

export function formatDateLong(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  }).format(date);
}
