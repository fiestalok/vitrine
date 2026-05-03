export function formatPrice(amount: number): string {
  return `${amount}€/jour`;
}

export function formatDateLong(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  }).format(date);
}
