import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { addDays, format } from 'date-fns';
import { AvailabilityCalendar } from '../components/product/AvailabilityCalendar';

const EMPTY = { start: null, end: null };

describe('AvailabilityCalendar', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    vi.useFakeTimers({ now: new Date(2026, 0, 15), toFake: ['Date'] });
    user = userEvent.setup();
  });
  afterEach(() => { vi.useRealTimers(); });

  it('renders the current month name', () => {
    render(<AvailabilityCalendar productId="1" unavailableDates={[]} range={EMPTY} onChange={() => {}} />);
    const monthFr = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(new Date());
    expect(screen.getByText(new RegExp(monthFr, 'i'))).toBeInTheDocument();
  });

  it('lets the user navigate to next month', async () => {
    render(<AvailabilityCalendar productId="1" unavailableDates={[]} range={EMPTY} onChange={() => {}} />);
    const before = screen.getByTestId('current-month').textContent;
    await user.click(screen.getByLabelText('Mois suivant'));
    const after = screen.getByTestId('current-month').textContent;
    expect(after).not.toBe(before);
  });

  it('premier clic définit le début (end null)', async () => {
    const onChange = vi.fn();
    const day = addDays(new Date(), 1);
    render(<AvailabilityCalendar productId="1" unavailableDates={[]} range={EMPTY} onChange={onChange} />);
    await user.click(screen.getByRole('button', { name: String(day.getDate()) }));
    expect(onChange).toHaveBeenCalledWith({ start: expect.any(Date), end: null });
  });

  it('deuxième clic définit la fin (plage)', async () => {
    const onChange = vi.fn();
    const start = addDays(new Date(), 1);
    const end = addDays(new Date(), 3);
    render(
      <AvailabilityCalendar
        productId="1"
        unavailableDates={[]}
        range={{ start, end: null }}
        onChange={onChange}
      />,
    );
    await user.click(screen.getByRole('button', { name: String(end.getDate()) }));
    expect(onChange).toHaveBeenCalledWith({ start, end: expect.any(Date) });
  });

  it('refuse une plage contenant un jour indisponible et affiche une alerte', async () => {
    const onChange = vi.fn();
    const start = addDays(new Date(), 1);
    const blocked = addDays(new Date(), 2);
    const end = addDays(new Date(), 3);
    render(
      <AvailabilityCalendar
        productId="1"
        unavailableDates={[format(blocked, 'yyyy-MM-dd')]}
        range={{ start, end: null }}
        onChange={onChange}
      />,
    );
    await user.click(screen.getByRole('button', { name: String(end.getDate()) }));
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});
