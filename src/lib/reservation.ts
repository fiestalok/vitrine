export interface ReservationInput {
  client: {
    type: 'particulier' | 'professionnel';
    first_name: string;
    last_name: string;
    company_name?: string;
    email: string;
    phone: string;
  };
  date_start: string;
  date_end: string;
  delivery: boolean;
  delivery_address?: string;
  notes: string;
  total_price: number;
  cartItems: { productId: string; quantity: number; unit_price: number }[];
}

export function buildReservationPayload(input: ReservationInput) {
  return {
    ...input,
    trackingToken: crypto.randomUUID(),
  };
}
