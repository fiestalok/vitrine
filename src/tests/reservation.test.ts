import { describe, it, expect, vi } from 'vitest';

import { buildReservationPayload } from '../lib/reservation';

describe('buildReservationPayload', () => {
  it('génère un tracking token UUID', () => {
    const payload = buildReservationPayload({
      client: { type: 'particulier', first_name: 'Marie', last_name: 'Dupont', email: 'm@test.fr', phone: '0600000000' },
      date_start: '2026-06-01',
      date_end: '2026-06-02',
      delivery: false,
      notes: '',
      total_price: 150,
      cartItems: [{ productId: 'chateau-royal', quantity: 1, unit_price: 150 }],
    });
    expect(payload.trackingToken).toMatch(/^[0-9a-f-]{36}$/);
  });
});
