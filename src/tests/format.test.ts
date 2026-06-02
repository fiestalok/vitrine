import { describe, it, expect } from 'vitest';
import { rentalDays, lineTotal, formatRange } from '../lib/format';

describe('rentalDays', () => {
  it('compte 1 jour pour une date de début seule', () => {
    expect(rentalDays('2026-06-01', null)).toBe(1);
  });
  it('compte 1 jour quand début === fin', () => {
    expect(rentalDays('2026-06-01', '2026-06-01')).toBe(1);
  });
  it('compte de façon inclusive (1er au 3 juin = 3 jours)', () => {
    expect(rentalDays('2026-06-01', '2026-06-03')).toBe(3);
  });
  it("renvoie 0 quand il n'y a pas de date", () => {
    expect(rentalDays(null, null)).toBe(0);
    expect(rentalDays(null, '2026-06-03')).toBe(0);
  });
  it('garde-fou : fin avant début renvoie 1', () => {
    expect(rentalDays('2026-06-03', '2026-06-01')).toBe(1);
  });
});

describe('lineTotal', () => {
  it('multiplie prix × jours × quantité', () => {
    expect(lineTotal(40, '2026-06-01', '2026-06-03', 1)).toBe(120);
  });
  it('prend en compte la quantité', () => {
    expect(lineTotal(40, '2026-06-01', '2026-06-03', 2)).toBe(240);
  });
  it('un seul jour = prix × quantité', () => {
    expect(lineTotal(40, '2026-06-01', '2026-06-01', 1)).toBe(40);
  });
  it('renvoie 0 sans date', () => {
    expect(lineTotal(40, null, null, 1)).toBe(0);
  });
});

describe('formatRange', () => {
  it('affiche une plage', () => {
    expect(formatRange('2026-06-01', '2026-06-03')).toBe('Du 01/06/2026 au 03/06/2026');
  });
  it('affiche un jour unique', () => {
    expect(formatRange('2026-06-01', '2026-06-01')).toBe('Le 01/06/2026');
  });
});
